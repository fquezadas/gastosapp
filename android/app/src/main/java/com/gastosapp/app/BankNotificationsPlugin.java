package com.gastosapp.app;

import android.content.*;
import android.content.pm.ResolveInfo;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.*;

@CapacitorPlugin(name = "BankNotifications")
public class BankNotificationsPlugin extends Plugin {
    @PluginMethod public void setOwner(PluginCall call) {
        synchronized (BankStore.class) {
            try {
                String owner = call.getString("owner", "");
                JSONObject data = BankStore.read(getContext());
                if (!owner.equals(data.optString("owner"))) BankStore.write(getContext(), new JSONObject().put("owner", owner));
                call.resolve();
            } catch (Exception e) { call.reject("No se pudo preparar la lectura de compras."); }
        }
    }
    private JSONObject owned(PluginCall call) throws Exception {
        JSONObject data = BankStore.read(getContext());
        if (data.optString("owner").isEmpty() || !data.optString("owner").equals(call.getString("owner"))) throw new Exception();
        return data;
    }
    @PluginMethod public void getState(PluginCall call) {
        synchronized (BankStore.class) {
            try {
                JSONObject data = owned(call);
                boolean access = NotificationManagerCompat.getEnabledListenerPackages(getContext())
                    .contains(getContext().getPackageName());
                if (data.optBoolean("enabled") && access && !BankNotificationService.isConnected()) {
                    BankNotificationService.requestReconnect(getContext());
                }
                JSObject result = new JSObject(data.toString());
                result.put("pending", BankStore.pending(data));
                result.put("packageNames", BankStore.selectedPackages(data));
                result.put("connected", BankNotificationService.isConnected());
                result.put("reconnecting", BankNotificationService.isReconnecting());
                result.put("access", access);
                result.remove("seen");
                call.resolve(result);
            } catch (Exception e) { call.reject("No se pudieron cargar las compras pendientes."); }
        }
    }
    @PluginMethod public void configure(PluginCall call) {
        synchronized (BankStore.class) {
            try {
                JSONObject data = owned(call);
                boolean enabled = call.getBoolean("enabled", false);
                JSArray packageNames = call.getArray("packageNames", new JSArray());
                if (enabled && packageNames.length() == 0) throw new Exception();
                for (int index = 0; index < packageNames.length(); index++) {
                    String packageName = packageNames.getString(index);
                    if (getContext().getPackageManager().getLaunchIntentForPackage(packageName) == null) throw new Exception();
                }
                if (!packageNames.toString().equals(BankStore.selectedPackages(data).toString())) {
                    data.remove("lastResult");
                    data.remove("lastCheckedAt");
                }
                data.remove("packageName");
                data.put("enabled", enabled).put("packageNames", new JSONArray(packageNames.toString()));
                BankStore.write(getContext(), data);
                call.resolve();
            } catch (Exception e) { call.reject("No se pudo cambiar la configuración."); }
        }
    }
    @PluginMethod public void dismiss(PluginCall call) {
        synchronized (BankStore.class) {
            try {
                JSONObject data = owned(call);
                JSONArray pending = BankStore.pending(data), remaining = new JSONArray();
                for (int i = 0; i < pending.length(); i++) {
                    JSONObject item = pending.getJSONObject(i);
                    if (!item.optString("id").equals(call.getString("id"))) remaining.put(item);
                }
                BankStore.write(getContext(), data.put("pending", remaining));
                call.resolve();
            } catch (Exception e) { call.reject("No se pudo quitar la compra pendiente."); }
        }
    }
    @PluginMethod public void reviewVisible(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            synchronized (BankStore.class) {
                try {
                    JSONObject data = owned(call);
                    if (!data.optBoolean("enabled")) { call.reject("Activa la lectura primero."); return; }
                    if (!NotificationManagerCompat.getEnabledListenerPackages(getContext()).contains(getContext().getPackageName())) {
                        call.reject("Habilita el acceso a notificaciones en Android."); return;
                    }
                    if (!BankNotificationService.isConnected()) {
                        BankNotificationService.requestReconnect(getContext());
                        call.reject("Se solicitó reconectar el servicio. Espera unos segundos y vuelve a revisar. Si continúa desconectado, desactiva y activa el acceso en Android.");
                        return;
                    }
                    int before = BankStore.pending(data).length();
                    BankNotificationService.reviewVisible();
                    JSONObject updated = owned(call);
                    JSObject response = new JSObject();
                    response.put("added", BankStore.pending(updated).length() - before);
                    call.resolve(response);
                } catch (Exception e) { call.reject("No se pudieron revisar las notificaciones visibles. Comprueba el acceso en Android."); }
            }
        });
    }
    @PluginMethod public void openSettings(PluginCall call) {
        try { getActivity().startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)); call.resolve(); }
        catch (Exception e) { call.reject("Abre Ajustes de Android y busca Acceso a notificaciones."); }
    }
    @PluginMethod public void listApps(PluginCall call) {
        JSArray apps = new JSArray();
        Intent intent = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER);
        java.util.Set<String> added = new java.util.HashSet<>();
        for (ResolveInfo info : getContext().getPackageManager().queryIntentActivities(intent, 0)) {
            String name = info.activityInfo.packageName;
            if (name.equals(getContext().getPackageName()) || !added.add(name)) continue;
            JSObject app = new JSObject();
            app.put("packageName", name);
            app.put("label", info.loadLabel(getContext().getPackageManager()).toString());
            apps.put(app);
        }
        JSObject result = new JSObject(); result.put("apps", apps); call.resolve(result);
    }
}
