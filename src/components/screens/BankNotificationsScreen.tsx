import { useEffect, useRef, useState } from 'react';
import { App as NativeApp } from '@capacitor/app';
import { bankNotifications, BankState, PendingPurchase, supportsBankNotifications } from '../../services/bankNotifications';
import { Transaction } from '../../types';
import { getLocalDateKey, formatCLP } from '../../utils/formatters';

interface Props {
  owner: string;
  onSave: (transaction: Transaction) => Promise<void>;
}
export function BankNotificationsScreen({ owner, onSave }: Props) {
  const [state, setState] = useState<BankState>({ access: false, pending: [] });
  const [apps, setApps] = useState<{ packageName: string; label: string }[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [editing, setEditing] = useState<PendingPurchase | null>(null);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<Transaction['category']>('otros');

  const refresh = async () => {
    const next = await bankNotifications.getState({ owner });
    setState(next);
    return next;
  };
  useEffect(() => {
    if (!supportsBankNotifications) return;
    setReady(false); setEditing(null); setState({ access: false, pending: [] });
    let active = true;
    let timer: ReturnType<typeof setInterval>;
    const refreshSafely = () => bankNotifications.getState({ owner }).then(next => {
      if (active) setState(next);
    }).catch(() => { if (active) setError('No se pudo actualizar la bandeja. Vuelve a abrir esta pantalla.'); });
    const listener = NativeApp.addListener('appStateChange', ({ isActive }) => { if (isActive) void refreshSafely(); });
    void (async () => {
      try {
        await bankNotifications.setOwner({ owner });
        const [next, installed] = await Promise.all([bankNotifications.getState({ owner }), bankNotifications.listApps()]);
        if (!active) return;
        setState(next);
        const defaultSources = installed.apps
          .filter(app => /scotia|billetera.*google|google.*wallet/i.test(app.label))
          .map(app => app.packageName);
        setSelectedPackages(next.packageNames?.length ? next.packageNames : defaultSources);
        setApps(installed.apps.sort((a, b) => a.label.localeCompare(b.label)));
        setReady(true);
        timer = setInterval(refreshSafely, 5000);
      } catch { if (active) setError('No se pudo iniciar la lectura de compras. Vuelve a abrir esta pantalla.'); }
    })();
    return () => { active = false; clearInterval(timer); void listener.then(handle => handle.remove()); };
  }, [owner]);

  async function perform(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await action(); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo completar la operación. Intenta nuevamente.'); }
    finally { lock.current = false; setBusy(false); }
  }
  function edit(item: PendingPurchase) {
    setEditing(item); setAmount(String(item.amount)); setMerchant(item.merchant);
    setDate(getLocalDateKey(new Date(item.receivedAt))); setCategory('otros');
  }
  const inputClass = 'w-full rounded-xl border border-[#dee8ff] bg-white p-3 text-sm';
  const candidateApps = apps.filter(app =>
    /scotia|billetera|wallet|banco|mercado|copec/i.test(app.label)
    || selectedPackages.includes(app.packageName)
  );
  const toggleSource = (packageName: string) => {
    setSelectedPackages(current => current.includes(packageName)
      ? current.filter(item => item !== packageName)
      : [...current, packageName]);
  };
  return <main className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-4">
    <h1 className="text-2xl font-bold">Compras bancarias</h1>
    {!supportsBankNotifications ? <p>La lectura de notificaciones está disponible en la aplicación Android. Puedes seguir registrando gastos manualmente aquí.</p> : <>
      <section className="bg-white border border-[#e7eeff] rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold">Detectar compras · Versión de prueba</h2>
        <p className="text-sm text-slate-600">Compatible con compras de App Scotia y Billetera de Google. Puedes activar ambas al mismo tiempo.</p>
        <p className="text-sm text-slate-600">Android concede acceso a las notificaciones del teléfono. GastosApp procesa únicamente las fuentes que selecciones y conserva en este dispositivo monto, comercio y hora de recepción. El gasto se guarda en tu cuenta cuando lo confirmas.</p>
        <fieldset disabled={!ready || busy || !!state.enabled} className="space-y-2">
          <legend className="text-sm font-medium mb-1">Fuentes de compra</legend>
          {candidateApps.length > 0 ? candidateApps.map(app => <label key={app.packageName} className="flex items-center gap-3 rounded-xl border border-[#dee8ff] bg-white p-3 text-sm">
            <input type="checkbox" checked={selectedPackages.includes(app.packageName)} onChange={() => toggleSource(app.packageName)} />
            <span>{app.label}</span>
          </label>) : <p className="text-sm text-slate-600">No se encontraron aplicaciones compatibles instaladas.</p>}
        </fieldset>
        <p className="text-sm">{state.enabled ? (state.access ? (state.connected ? 'Lectura activada · Servicio conectado' : state.reconnecting ? 'Permiso concedido · Reconectando servicio…' : 'Permiso concedido · Servicio desconectado') : 'Falta permitir el acceso en Android') : 'Lectura desactivada'}</p>
        <button disabled={!ready || busy || (!state.enabled && selectedPackages.length === 0)} className="w-full rounded-xl bg-[#006c49] text-white p-3 disabled:opacity-50" onClick={() => void perform(async () => {
          await bankNotifications.configure({ owner, packageNames: selectedPackages, enabled: !state.enabled });
          const next = await refresh();
          if (next.enabled && !next.access) await bankNotifications.openSettings();
        })}>{state.enabled ? 'Desactivar lectura' : 'Activar lectura'}</button>
        <button disabled={busy} className="text-sm text-[#006c49] underline" onClick={() => void perform(() => bankNotifications.openSettings())}>Administrar acceso en Android</button>
        <button disabled={!ready || busy || !state.enabled || !state.access} className="w-full rounded-xl border border-[#006c49] text-[#006c49] p-3 disabled:opacity-50" onClick={() => void perform(async () => {
          setReviewMessage('');
          const result = await bankNotifications.reviewVisible({ owner });
          await refresh();
          setReviewMessage(result.added > 0 ? `${result.added} compra(s) agregada(s) para revisar.` : 'No se agregaron compras. Revisa el estado de abajo y comprueba que la notificación de la aplicación seleccionada siga visible.');
        })}>Revisar notificaciones visibles</button>
        <p className="text-xs text-slate-500">Este botón revisa notificaciones anteriores que aún estén en el panel de Android, solo de las fuentes activas. No recupera las que ya descartaste.</p>
        {state.enabled && state.access && !state.connected && <p className="text-xs text-amber-700">GastosApp está solicitando la reconexión automáticamente. En teléfonos Xiaomi, configura GastosApp sin restricciones de batería y permite el inicio automático para reducir desconexiones en segundo plano.</p>}
        {reviewMessage && <p role="status" className="text-sm">{reviewMessage}</p>}
        <p className="text-xs text-slate-600">Última revisión: {state.lastCheckedAt ? new Date(state.lastCheckedAt).toLocaleString('es-CL') : 'Todavía no se recibió una notificación de una fuente activa.'}</p>
        {state.lastResult && <p className="text-xs text-slate-600">{{
          captured: 'Compra reconocida y guardada como pendiente.',
          duplicate: 'Notificación ya procesada; no se volvió a agregar.',
          full: 'La bandeja está llena. Revisa o descarta pendientes.',
          empty: 'Android entregó una notificación sin texto legible.',
          unrecognized: 'Se recibió texto, pero no coincide con los formatos admitidos.',
          error: 'No se pudo procesar o guardar la notificación.',
        }[state.lastResult] || 'Resultado no disponible.'}</p>}
        <p className="text-xs text-slate-500">Solo compras nuevas en CLP con un monto reconocible. Los formatos ambiguos se omiten. La fecha propuesta es la de recepción: revísala. Al cambiar de cuenta o cerrar sesión se borran los pendientes y se desactiva la lectura.</p>
      </section>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <h2 className="font-semibold">Pendientes de revisión ({state.pending.length})</h2>
      <p className="text-xs text-slate-500">Revisa si ya registraste la compra manualmente. Puedes conservar hasta 200 pendientes.</p>
      {ready && state.pending.length === 0 && <p className="text-sm text-slate-600">Todavía no hay compras pendientes. Aparecerán aquí cuando llegue una notificación compatible.</p>}
      {state.pending.map(item => <article key={item.id} className="bg-white rounded-2xl border border-[#e7eeff] p-4 space-y-3">
        <p className="font-semibold">{formatCLP(item.amount)} · {item.merchant || 'Comercio por completar'}</p>
        {item.source && <p className="text-xs text-slate-500">Origen: {item.source}</p>}
        <p className="text-xs text-slate-500">Recibida: {new Date(item.receivedAt).toLocaleString('es-CL')}</p>
        {editing?.id === item.id ? <form className="space-y-3" onSubmit={event => {
          event.preventDefault();
          void perform(async () => {
            const value = Number(amount);
            if (!Number.isSafeInteger(value) || value <= 0 || value > 999999999 || !merchant.trim() || !date || date > getLocalDateKey()) throw new Error('Revisa el monto, comercio y fecha.');
            await onSave({ id: item.id, title: merchant.trim(), place: merchant.trim(), amount: value,
              category, date, isToday: date === getLocalDateKey(),
              time: new Date(item.receivedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) });
            await bankNotifications.dismiss({ owner, id: item.id });
            setEditing(null); await refresh();
          });
        }}>
          <label className="block text-sm">Monto CLP<input required type="number" min="1" max="999999999" step="1" className={inputClass} value={amount} onChange={e => setAmount(e.target.value)} /></label>
          <label className="block text-sm">Comercio<input required maxLength={80} className={inputClass} value={merchant} onChange={e => setMerchant(e.target.value)} /></label>
          <label className="block text-sm">Fecha<input required type="date" max={getLocalDateKey()} className={inputClass} value={date} onChange={e => setDate(e.target.value)} /></label>
          <label className="block text-sm">Categoría<select className={inputClass} value={category} onChange={e => setCategory(e.target.value as Transaction['category'])}>
            <option value="cafe">Café</option><option value="snacks">Snacks</option><option value="bebidas">Bebidas</option><option value="antojos">Antojos</option><option value="transporte">Transporte</option><option value="otros">Otros</option>
          </select></label>
          <button disabled={busy} className="rounded-xl bg-[#006c49] text-white p-3 disabled:opacity-50">Confirmar gasto</button>
          <button type="button" disabled={busy} className="ml-3 text-sm" onClick={() => setEditing(null)}>Cancelar</button>
        </form> : <button disabled={busy} className="text-[#006c49] font-semibold text-sm" onClick={() => edit(item)}>Revisar compra</button>}
        <button disabled={busy} className="block text-sm text-red-700" onClick={() => void perform(async () => {
          await bankNotifications.dismiss({ owner, id: item.id });
          if (editing?.id === item.id) setEditing(null);
          await refresh();
        })}>Descartar</button>
      </article>)}
    </>}
  </main>;
}
