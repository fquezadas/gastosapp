package com.gastosapp.app;

import android.app.Notification;
import android.content.ComponentName;
import android.content.Context;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import org.json.*;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

public class BankNotificationService extends NotificationListenerService {
    private static final long REBIND_COOLDOWN_MS = 15_000L;
    private static volatile BankNotificationService connected;
    private static volatile long lastRebindRequestAt;

    public static boolean isConnected() { return connected != null; }
    public static boolean isReconnecting() {
        return !isConnected() && System.currentTimeMillis() - lastRebindRequestAt < REBIND_COOLDOWN_MS;
    }
    public static boolean requestReconnect(Context context) {
        if (isConnected()) return false;
        long now = System.currentTimeMillis();
        if (now - lastRebindRequestAt < REBIND_COOLDOWN_MS) return false;
        lastRebindRequestAt = now;
        requestRebind(new ComponentName(context, BankNotificationService.class));
        return true;
    }
    @Override public void onListenerConnected() {
        connected = this;
        lastRebindRequestAt = 0L;
    }
    @Override public void onListenerDisconnected() {
        if (connected == this) connected = null;
        requestReconnect(this);
    }
    @Override public void onDestroy() {
        if (connected == this) connected = null;
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
                if (pending.length() >= 200) { result(data, "full"); return; }
                pending.put(new JSONObject().put("id", id).put("amount", purchase.amount)
                    .put("merchant", purchase.merchant).put("receivedAt", sbn.getPostTime())
                    .put("source", sourceLabel(sbn.getPackageName())));
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
