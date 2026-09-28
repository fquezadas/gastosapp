package com.gastosapp.app;

import org.junit.Test;
import static org.junit.Assert.*;

public class PurchaseDeduplicatorTest {
    @Test public void groupsWalletAndScotiaVariantsOfTheSameMerchant() {
        assertTrue(PurchaseDeduplicator.representsSamePurchase(
            3290, "MINIMARKET NICO", 1_000_000L,
            3290, "MINIMARKET NICOLL", 1_060_000L));
    }

    @Test public void doesNotGroupDifferentAmountsOrDistantTransactions() {
        assertFalse(PurchaseDeduplicator.representsSamePurchase(
            3290, "MINIMARKET NICO", 1_000_000L,
            3291, "MINIMARKET NICOLL", 1_060_000L));
        assertFalse(PurchaseDeduplicator.representsSamePurchase(
            3290, "MINIMARKET NICO", 1_000_000L,
            3290, "MINIMARKET NICOLL", 1_120_001L));
    }

    @Test public void doesNotGroupShortOrDifferentMerchants() {
        assertFalse(PurchaseDeduplicator.representsSamePurchase(
            3290, "ABC", 1_000_000L,
            3290, "ABCD", 1_030_000L));
        assertFalse(PurchaseDeduplicator.representsSamePurchase(
            3290, "MINIMARKET NICO", 1_000_000L,
            3290, "OTRO COMERCIO", 1_030_000L));
    }
}
