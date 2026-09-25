package com.gastosapp.app;

import org.junit.Test;
import static org.junit.Assert.*;

public class PurchaseParserTest {
    @Test public void readsScotiabankGoDebitNotification() {
        String notification = "MINIMARKET NICOLL\n"
            + "Se realizó compra con tu tarjeta de débito xxxx0000 por $4.750 en MINIMARKET NICO. "
            + "Si desconoces esta operación puedes apagar o bloquear tus tarjetas desde tu ScotiaWeb "
            + "o tu App ScotiabankGO. En caso de dudas contáctanos al 600 600 1100.";
        PurchaseParser.Purchase item = PurchaseParser.parse(notification);
        assertNotNull(item);
        assertEquals(4750, item.amount);
        assertEquals("MINIMARKET NICO", item.merchant);
    }
    @Test public void readsScotiaCurrentAccountPayment() {
        String text = "App Scotia\nSe realizó un pago con tu Cuenta Corriente xxxx0000 por $18.823 en Servipag. "
            + "Si desconoces esta operación contáctanos al 600 600 1100.";
        PurchaseParser.Purchase item = PurchaseParser.parse(text);
        assertNotNull(item);
        assertEquals(18823, item.amount);
        assertEquals("Servipag", item.merchant);
    }
    @Test public void doesNotTreatCardRepaymentAsPurchase() {
        assertNull(PurchaseParser.parse("Pago por $18.823 a tu Tarjeta Ripley\n"
            + "Has realizado un pago por $18.823 a tu Tarjeta Ripley terminada en 0000 el 21/09/2026 a las 00:00."));
    }
    @Test public void rejectsUnconfirmedOrAmbiguousAccountPayments() {
        String[] messages = {
            "No se realizó un pago con tu Cuenta Corriente por $18.823 en Servipag.",
            "Se realizó un pago con tu Cuenta Corriente por $18.823 en Servipag. Pago rechazado.",
            "Se realizó un pago con tu Cuenta Corriente por $18.823 en Servipag. Operación anulada.",
            "Se realizó un pago con tu Cuenta Corriente por USD $18.823 en Servipag.",
            "Se realizó un pago con tu Cuenta Corriente por $18.823.",
            "Se realizó un pago con tu Cuenta Corriente por $18.823 en Servipag y $2.000 de comisión.",
            "Recibiste un pago por $18.823.",
            "Realiza un pago con tu Cuenta Corriente por $18.823 en Servipag."
        };
        for (String message : messages) assertNull(message, PurchaseParser.parse(message));
    }
    @Test public void readsSeptember22ScotiaNotification() {
        PurchaseParser.Purchase item = PurchaseParser.parse("App Scotia\n"
            + "Se realizó compra con tu tarjeta de débito xxxx0000 por $3.290 en MINIMARKET NICO. "
            + "Si desconoces esta operación puedes apagar o bloquear tus tarjetas desde tu ScotiaWeb "
            + "o tu App ScotiabankGO. En caso de dudas contáctanos al 600 600 1100.");
        assertNotNull(item);
        assertEquals(3290, item.amount);
        assertEquals("MINIMARKET NICO", item.merchant);
    }
    @Test public void readsGoogleWalletTransactionNotification() {
        PurchaseParser.Purchase item = PurchaseParser.parseGoogleWallet("MINIMARKET NICOLL\n"
            + "CLP3,290 con Visa Débito Scotiabank ••3173");
        assertNotNull(item);
        assertEquals(3290, item.amount);
        assertEquals("MINIMARKET NICOLL", item.merchant);
    }
    @Test public void rejectsGoogleWalletLikeMessagesOutsideItsFormat() {
        assertNull(PurchaseParser.parseGoogleWallet("MINIMARKET NICOLL\nCLP3,290"));
        assertNull(PurchaseParser.parseGoogleWallet("MINIMARKET NICOLL\nUSD3,290 con Visa"));
        assertNull(PurchaseParser.parseGoogleWallet("\nCLP3,290 con Visa"));
    }
    @Test public void readsClpPurchase() {
        PurchaseParser.Purchase item = PurchaseParser.parse("Compra por $12.990 en LIDER con tu tarjeta terminada en 1234");
        assertNotNull(item); assertEquals(12990, item.amount); assertEquals("LIDER", item.merchant);
    }
    @Test public void supportsUnformattedAndClpAmounts() {
        assertEquals(12990, PurchaseParser.parse("Compraste CLP 12990 en LIDER").amount);
        assertEquals(12990, PurchaseParser.parse("Compra $12.990,00 en LIDER").amount);
    }
    @Test public void rejectsUnsafeOrAmbiguousContent() {
        String[] messages = {
            "Compra rechazada por $12.990", "Compra anulada por $12.990", "Código para compra $12.990: 123456",
            "Confirma tu compra por $12.990", "Compra USD $12.99", "Compra $12,99", "Compra $1.23",
            "Compra $100 con saldo $900", "Transferencia por $100", "Compra por $0", "Compra por $9999999999999999999999",
            "Compra por $12.990 con descuento", "Tienes un nuevo movimiento", "No reconoces esta compra $100", "Compra $12.990,50"
        };
        for (String message : messages) assertNull(message, PurchaseParser.parse(message));
    }
    @Test public void doesNotKeepCardDigitsAsMerchant() {
        assertEquals("", PurchaseParser.parse("Compra $100 en tarjeta 1234567890123456").merchant);
    }
}
