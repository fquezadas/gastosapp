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
