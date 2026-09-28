package com.gastosapp.app;

import android.app.Notification;
import android.content.ComponentName;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import org.json.*;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

public class BankNotificationService extends NotificationListenerService {
    private static final long REBIND_COOLDOWN_MS = 15_000L;
    private static final long DISCONNECT_REBIND_DELAY_MS = 1_000L;
    private static final int MAX_AUTOMATIC_RECONNECTS = 2;
    private static volatile BankNotificationService connected;
    private static volatile long lastRebindRequestAt;
    private static volatile int reconnectAttempts;

    public static boolean isConnected() { return connected != null; }
    public static boolean isReconnecting() {
        return !isConnected() && lastRebindRequestAt > 0
            && System.currentTimeMillis() - lastRebindRequestAt < REBIND_COOLDOWN_MS;
    }
    public static int reconnectAttempts() { return reconnectAttempts; }
    public static boolean requestReconnect(Context context, boolean manual) {
        if (isConnected()) return false;
        long now = System.currentTimeMillis();
        if (now - lastRebindRequestAt < REBIND_COOLDOWN_MS) return false;
        if (!manual && reconnectAttempts >= MAX_AUTOMATIC_RECONNECTS) return false;
        lastRebindRequestAt = now;
        reconnectAttempts++;
        requestRebind(new ComponentName(context, BankNotificationService.class));
        return true;
    }
    @Override public void onCreate() {
        super.onCreate();
        BankStore.recordServiceEvent(this, "created");
    }
    @Override public void onListenerConnected() {
        connected = this;
        lastRebindRequestAt = 0L;
        reconnectAttempts = 0;
        BankStore.recordServiceEvent(this, "connected");
    }
    @Override public void onListenerDisconnected() {
        if (connected == this) connected = null;
        BankStore.recordServiceEvent(this, "disconnected");
        new Handler(Looper.getMainLooper()).postDelayed(
            () -> requestReconnect(this, false), DISCONNECT_REBIND_DELAY_MS);
    }
    @Override public void onDestroy() {
        if (connected == this) connected = null;
        BankStore.recordServiceEvent(this, "destroyed");
        super.onDestroy();
    }
    // Invoked on the main thread by the plugin, only following an explicit user request.
    public static int reviewVisible() {
        BankNotificationService service = connected;
        if (service == null) throw new IllegalStateException("El servicio no está conectado. Vuelve a habilitar el acceso en Android.");
        StatusBarNotification[] notifications = service.getActiveNotifications();
        if (notifications == null) throw new IllegalStateException("Android no entregó las notificaciones visibles.");
        for (StatusBarNotification notification : notifications) service.onNotificationPosted(notification);
        return notifications.length;
    }
    private void result(JSONObject data, String status) throws Exception {
        data.put("lastResult", status).put("lastCheckedAt", System.currentTimeMillis());
        BankStore.write(this, data);
    }

    @Override public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null || (sbn.getNotification().flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;
        synchronized (BankStore.class) {
            try {
                JSONObject data = BankStore.read(this);
                if (!data.optBoolean("enabled") || data.optString("owner").isEmpty()
                    || !BankStore.isSelected(data, sbn.getPackageName())) return;
                Notification notification = sbn.getNotification();
                CharSequence body = notification.extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
                if (body == null || body.toString().trim().isEmpty()) body = notification.extras.getCharSequence(Notification.EXTRA_TEXT, "");
                if (body == null) body = "";
                String text = notification.extras.getCharSequence(Notification.EXTRA_TITLE, "") + "\n" + body;
                PurchaseParser.Purchase purchase = PurchaseParser.GOOGLE_WALLET_PACKAGE.equals(sbn.getPackageName())
                    ? PurchaseParser.parseGoogleWallet(text)
                    : PurchaseParser.parse(text);
                if (purchase == null) {
                    result(data, body.toString().trim().isEmpty() ? "empty" : "unrecognized");
                    return;
                }
                // Same key + content denotes an update/re-delivery, but separate purchases retain distinct IDs.
                long eventTime = notification.when > 0 ? notification.when : sbn.getPostTime();
                String fingerprint = data.optString("owner") + "|" + sbn.getKey() + "|" + eventTime + "|" + text;
                String id = UUID.nameUUIDFromBytes(fingerprint.getBytes(StandardCharsets.UTF_8)).toString();
                JSONObject seen = data.optJSONObject("seen");
                if (seen == null) seen = new JSONObject();
                long now = System.currentTimeMillis();
                java.util.List<String> expired = new java.util.ArrayList<>();
                java.util.Iterator<String> keys = seen.keys();
                while (keys.hasNext()) { String key = keys.next(); if (now - seen.optLong(key) > 30L * 86400000) expired.add(key); }
                for (String key : expired) seen.remove(key);
                if (seen.has(id)) { result(data, "duplicate"); return; }
                JSONArray pending = BankStore.pending(data);
                String source = sourceLabel(sbn.getPackageName());
                for (int index = 0; index < pending.length(); index++) {
                    JSONObject existing = pending.getJSONObject(index);
                    if (!PurchaseDeduplicator.representsSamePurchase(
                        existing.optLong("amount"), existing.optString("merchant"), existing.optLong("receivedAt"),
                        purchase.amount, purchase.merchant, sbn.getPostTime())) continue;
                    JSONArray sources = existing.optJSONArray("sources");
                    if (sources == null) {
                        sources = new JSONArray();
                        String legacySource = existing.optString("source");
                        if (!legacySource.isEmpty()) sources.put(legacySource);
                    }
                    boolean alreadyPresent = false;
                    for (int sourceIndex = 0; sourceIndex < sources.length(); sourceIndex++) {
                        if (source.equals(sources.optString(sourceIndex))) alreadyPresent = true;
                    }
                    if (!alreadyPresent) sources.put(source);
                    existing.put("sources", sources);
                    seen.put(id, now);
                    data.put("pending", pending).put("seen", seen);
                    result(data, "merged");
                    return;
                }
                if (pending.length() >= 200) { result(data, "full"); return; }
                pending.put(new JSONObject().put("id", id).put("amount", purchase.amount)
                    .put("merchant", purchase.merchant).put("receivedAt", sbn.getPostTime())
                    .put("source", source).put("sources", new JSONArray().put(source)));
                seen.put(id, now);
                data.put("pending", pending).put("seen", seen);
                result(data, "captured");
            } catch (Exception ignored) {
                // Persist only an error code, never notification text or exception payloads.
                try { result(BankStore.read(this), "error"); } catch (Exception storageError) { }
            }
        }
    }

    private String sourceLabel(String packageName) {
        try {
            return getPackageManager().getApplicationLabel(
                getPackageManager().getApplicationInfo(packageName, 0)).toString();
        } catch (Exception ignored) {
            return "Aplicación seleccionada";
        }
    }
}
