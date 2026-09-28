package com.gastosapp.app;

import java.text.Normalizer;

final class PurchaseDeduplicator {
    private PurchaseDeduplicator() {}

    static boolean representsSamePurchase(long firstAmount, String firstMerchant, long firstReceivedAt,
                                          long secondAmount, String secondMerchant, long secondReceivedAt) {
        if (firstAmount != secondAmount || Math.abs(firstReceivedAt - secondReceivedAt) > 120_000L) return false;
        String first = normalizeMerchant(firstMerchant);
        String second = normalizeMerchant(secondMerchant);
        if (first.length() < 5 || second.length() < 5) return false;
        return first.equals(second) || first.startsWith(second) || second.startsWith(first);
    }

    private static String normalizeMerchant(String merchant) {
        return Normalizer.normalize(merchant == null ? "" : merchant, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .replaceAll("[^A-Za-z0-9]", "")
            .toLowerCase(java.util.Locale.ROOT);
    }
}
