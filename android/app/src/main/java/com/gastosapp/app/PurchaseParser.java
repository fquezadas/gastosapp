package com.gastosapp.app;

import java.text.Normalizer;
import java.util.regex.*;

/** Conservative CLP-only parser. Never persists the full notification or card numbers. */
public final class PurchaseParser {
    public static final class Purchase {
        public final long amount;
        public final String merchant;
        Purchase(long amount, String merchant) { this.amount = amount; this.merchant = merchant; }
    }
    public static Purchase parse(String text) {
        if (text == null || text.length() > 8000) return null;
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "").toLowerCase(java.util.Locale.ROOT);
        if (!Pattern.compile("\\b(compra|compraste|comprado)\\b").matcher(normalized).find()) return null;
        if (Pattern.compile("rechaz|anulad|revers|devol|intento|no realizada|no reconoc|codigo|clave|otp|autoriza|confirma|saldo|cupo|oferta|descuento|usd|us\\$|dolar|eur").matcher(normalized).find()) return null;
        Matcher money = Pattern.compile("(?:CLP\\s*\\$?|\\$)\\s*([0-9][0-9.,]*)(?![0-9])", Pattern.CASE_INSENSITIVE).matcher(text);
        if (!money.find()) return null;
        String value = money.group(1).replaceAll("[.,]$", "");
        if (!value.matches("(?:[1-9][0-9]*|[1-9][0-9]{0,2}(?:\\.[0-9]{3})+)(?:,00)?")) return null;
        long amount;
        try { amount = Long.parseLong(value.replace(",00", "").replace(".", "")); }
        catch (NumberFormatException e) { return null; }
        if (amount <= 0 || amount > 999999999 || money.find()) return null;
        Matcher merchant = Pattern.compile("\\ben\\s+(.+?)(?=\\s+(?:con|por|el|a las|tarjeta)\\b|[.;\\n]|$)", Pattern.CASE_INSENSITIVE).matcher(text);
        String place = merchant.find() ? merchant.group(1).trim() : "";
        if (place.length() > 80 || place.contains("$") || place.matches(".*\\d{4,}.*")) place = "";
        return new Purchase(amount, place);
    }
}
