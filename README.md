<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/25e8c948-146d-4e77-a947-6f6038e0ad4b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Google Login in Production

Set these variables in the deployment environment:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-public-domain.example
```

In Supabase, open **Authentication -> URL Configuration** and add the exact value of `VITE_APP_URL` to **Redirect URLs**. Also set the same domain as **Site URL**. Google OAuth will otherwise work locally but fail when the app is opened from a shared production link.

## Compras desde notificaciones (Android, experimental)

En el menú del avatar, abre **Compras bancarias**, selecciona la aplicación instalada
del banco y activa la lectura. Android abrirá el ajuste de acceso a notificaciones;
habilita GastosApp y vuelve a la app. La selección admite una aplicación a la vez.
La primera integración está orientada a ScotiabankGO: se preselecciona si su nombre
aparece entre las aplicaciones instaladas. Una prueba automatizada valida el ejemplo
de compra de débito aportado (con tarjeta anonimizada): $4.750 en MINIMARKET NICO,
incluido el aviso de bloqueo posterior. Falta validar la recepción en un teléfono
real; otros formatos de Scotiabank u otros bancos pueden requerir ajustes.

Las nuevas compras reconocibles aparecen como pendientes. Revisa monto, comercio,
fecha y categoría antes de confirmar; también puedes descartarlas. La fecha inicial
es la de recepción, no necesariamente la de la transacción. La captura requiere el
servicio de Android habilitado y está sujeta a restricciones del sistema/fabricante.
No se recupera un historial de notificaciones anteriores a la activación. Web e iOS
muestran que esta función requiere Android.

El servicio procesa únicamente el paquete seleccionado. Guarda hasta 200 pendientes
en almacenamiento privado excluido de copias de seguridad; no guarda texto original,
números de tarjeta ni códigos. Conserva huellas de deduplicación durante 30 días.
Desactivar detiene la captura y conserva pendientes; cerrar sesión o cambiar de cuenta
borra la bandeja y desactiva la captura. Confirmar guarda el gasto en la cuenta actual
(o localmente en modo demo). Un fallo al guardar mantiene la compra pendiente y los
reintentos usan el mismo identificador. La deduplicación no relaciona gastos manuales
ni notificaciones distintas del banco que representen una misma compra.

Validación:

```sh
npm run lint
npm run build
npx cap copy android
cd android
./gradlew :app:testDebugUnitTest :app:assembleDebug
```

Prueba en teléfono: seleccionar el banco, conceder/denegar/revocar permiso, recibir
una compra con GastosApp en segundo plano, revisar y confirmar, cerrar/reabrir, y
verificar que no reaparezca. Probar descarte, desactivación, cambio de cuenta y un
fallo de conexión al confirmar. Comparar con notificaciones reales para ajustar el
lector; mensajes rechazados, autenticación, moneda extranjera y montos ambiguos se
omiten. No registrar datos sensibles en logs durante estas pruebas.
