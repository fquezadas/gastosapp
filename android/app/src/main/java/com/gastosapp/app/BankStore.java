package com.gastosapp.app;

import android.content.Context;
import android.util.AtomicFile;
import org.json.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

final class BankStore {
    static synchronized JSONObject read(Context context) throws Exception {
        AtomicFile file = file(context);
        if (!file.getBaseFile().exists()) return new JSONObject();
        return new JSONObject(new String(file.readFully(), StandardCharsets.UTF_8));
    }
    static synchronized void write(Context context, JSONObject data) throws Exception {
        AtomicFile file = file(context);
        FileOutputStream out = file.startWrite();
        try { out.write(data.toString().getBytes(StandardCharsets.UTF_8)); file.finishWrite(out); }
        catch (Exception e) { file.failWrite(out); throw e; }
    }
    private static AtomicFile file(Context context) {
        return new AtomicFile(new File(context.getNoBackupFilesDir(), "bank-notifications.json"));
    }
    static JSONArray pending(JSONObject data) { return data.optJSONArray("pending") == null ? new JSONArray() : data.optJSONArray("pending"); }
    static JSONArray selectedPackages(JSONObject data) {
        JSONArray packages = data.optJSONArray("packageNames");
        if (packages != null) return packages;
        String legacyPackage = data.optString("packageName");
        return legacyPackage.isEmpty() ? new JSONArray() : new JSONArray().put(legacyPackage);
    }
    static boolean isSelected(JSONObject data, String packageName) {
        JSONArray packages = selectedPackages(data);
        for (int index = 0; index < packages.length(); index++) {
            if (packageName.equals(packages.optString(index))) return true;
        }
        return false;
    }
}
