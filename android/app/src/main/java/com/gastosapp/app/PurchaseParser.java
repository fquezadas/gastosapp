package com.gastosapp.app;

import java.text.Normalizer;
import java.util.regex.*;

/** Conservative CLP-only parser. Never persists the full notification or card numbers. */
public final class PurchaseParser {
    public static final String GOOGLE_WALLET_PACKAGE = "com.google.android.apps.walletnfcrel";
    public static final class Purchase {
        public final long amount;
        public final String merchant;
        Purchase(long amount, String merchant) { this.amount = amount; this.merchant = merchant; }
    }
    public static Purchase parse(String text) {
        if (text == null || text.length() > 8000) return null;
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "").toLowerCase(java.util.Locale.ROOT);
        boolean isPurchase = Pattern.compile("\\b(compra|compraste|comprado)\\b").matcher(normalized).find();
        // Scotia reports account-funded payments separately from card purchases.
        // Keep this narrow: generic "pago" also covers card repayments and incoming payments.
        boolean isAccountPayment = Pattern.compile("(?m)^\\s*se realizo un pago con tu cuenta corriente\\b")
            .matcher(normalized).find();
        if (!isPurchase && !isAccountPayment) return null;
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
        if (isAccountPayment && place.isEmpty()) return null;
        return new Purchase(amount, place);
    }

    /** Google Wallet's transaction alert uses the merchant as title and omits "compra". */
    public static Purchase parseGoogleWallet(String text) {
        if (text == null || text.length() > 8000) return null;
        String[] lines = text.split("\n", 2);
        if (lines.length != 2) return null;
        String merchant = lines[0].trim();
        if (merchant.isEmpty() || merchant.length() > 80 || merchant.matches(".*\\d{4,}.*")) return null;
        Matcher money = Pattern.compile("\\bCLP\\s*([0-9][0-9.,]*)(?![0-9])", Pattern.CASE_INSENSITIVE).matcher(lines[1]);
        if (!money.find() || !Pattern.compile("\\bcon\\s+", Pattern.CASE_INSENSITIVE).matcher(lines[1]).find()) return null;
        String value = money.group(1).replaceAll("[.,]$", "");
        if (value.contains(",") && !value.matches("[1-9][0-9]{0,2}(?:,[0-9]{3})+")) return null;
        value = value.replace(",", "");
        if (!value.matches("(?:[1-9][0-9]*|[1-9][0-9]{0,2}(?:\\.[0-9]{3})+)(?:,00)?")) return null;
        try {
            long amount = Long.parseLong(value.replace(",00", "").replace(".", ""));
            return amount > 0 && amount <= 999999999 ? new Purchase(amount, merchant) : null;
        } catch (NumberFormatException error) {
            return null;
        }
    }
}
