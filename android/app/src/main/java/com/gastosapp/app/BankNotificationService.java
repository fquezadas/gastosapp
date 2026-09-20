package com.gastosapp.app;

import android.app.Notification;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import org.json.*;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

public class BankNotificationService extends NotificationListenerService {
    @Override public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null || (sbn.getNotification().flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;
        synchronized (BankStore.class) {
            try {
                JSONObject data = BankStore.read(this);
                if (!data.optBoolean("enabled") || data.optString("owner").isEmpty()
                    || !sbn.getPackageName().equals(data.optString("packageName"))) return;
                Notification notification = sbn.getNotification();
                CharSequence body = notification.extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
                if (body == null) body = notification.extras.getCharSequence(Notification.EXTRA_TEXT, "");
                String text = notification.extras.getCharSequence(Notification.EXTRA_TITLE, "") + "\n" + body;
                PurchaseParser.Purchase purchase = PurchaseParser.parse(text);
                if (purchase == null) return;
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
                if (seen.has(id)) return;
                JSONArray pending = BankStore.pending(data);
                if (pending.length() >= 200) return;
                pending.put(new JSONObject().put("id", id).put("amount", purchase.amount)
                    .put("merchant", purchase.merchant).put("receivedAt", sbn.getPostTime()));
                seen.put(id, now);
                data.put("pending", pending).put("seen", seen);
                BankStore.write(this, data);
            } catch (Exception ignored) { /* Do not log financial notification content. */ }
        }
    }
}
