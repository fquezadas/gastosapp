import React, { useState } from 'react';
import { BudgetSettings, Transaction, ScreenTab } from '../../types';
import { formatCLP, formatNumberWithDots, getLocalDateKey } from '../../utils/formatters';

interface BudgetSettingsScreenProps {
  budget: BudgetSettings;
  transactions: Transaction[];
  onSaveBudget: (newBudget: BudgetSettings) => void;
  onNavigate: (tab: ScreenTab) => void;
}

export const BudgetSettingsScreen: React.FC<BudgetSettingsScreenProps> = ({
  budget,
  transactions,
  onSaveBudget,
  onNavigate,
}) => {
  const [budgetVal, setBudgetVal] = useState<number>(budget.dailyLimit);
  const [alertAt80, setAlertAt80] = useState<boolean>(budget.alertAt80);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Today's actual spending
  const spentToday = transactions
    .filter((tx) => tx.date === getLocalDateKey())
    .reduce((acc, curr) => acc + curr.amount, 0);

  const remainingPreview = Math.max(0, budgetVal - spentToday);
  const percentUsed = budgetVal > 0 ? Math.min(100, Math.round((spentToday / budgetVal) * 100)) : 0;
  const alertThreshold = Math.round(budgetVal * 0.8);

  const handleQuickPreset = (amount: number) => {
    setBudgetVal(amount);
  };

  const handleSave = () => {
    onSaveBudget({
      dailyLimit: budgetVal,
      alertAt80,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onNavigate('dashboard');
    }, 900);
  };

  return (
    <main className="max-w-md mx-auto px-4 pt-3 pb-28 flex flex-col gap-5 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[#944a00] mb-0.5">
          <span className="material-symbols-outlined text-sm">tune</span>
          <span className="text-xs font-semibold uppercase tracking-wider">
            Ajustes de control
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#111c2d]">Definir Presupuesto Diario</h1>
        <p className="text-sm text-[#3c4a42]">
          Establece tu límite de gastos diarios para mantener tus finanzas bajo control y recibir
          alertas oportunas (CLP).
        </p>
      </div>

      {/* Budget Input Card */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e7eeff] flex flex-col gap-4">
        <label className="text-sm font-medium text-[#3c4a42]">Límite diario sugerido</label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-2xl font-bold text-[#006c49]">$</span>
          <input
            id="budgetInput"
            type="text"
            inputMode="numeric"
            value={formatNumberWithDots(budgetVal)}
            onChange={(e) => {
              const num = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
              setBudgetVal(num);
            }}
            className="w-full pl-10 pr-16 py-3 bg-[#f0f3ff] border border-[#bbcabf]/50 rounded-xl text-2xl font-bold text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:border-transparent transition-all"
          />
          <span className="absolute right-4 text-sm font-medium text-[#3c4a42]">CLP</span>
        </div>

        {/* Quick Options Chips */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs text-[#3c4a42]">Opciones rápidas de ajuste</span>
          <div className="grid grid-cols-4 gap-2">
            {[5000, 10000, 15000, 20000].map((val) => {
              const isSelected = budgetVal === val;
              const label = `$${val / 1000}k`;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickPreset(val)}
                  className={`py-2 px-1 rounded-xl text-sm font-medium transition-all text-center border ${
                    isSelected
                      ? 'bg-[#10b981] text-[#00422b] font-bold border-transparent shadow-xs'
                      : 'bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#111c2d] border-[#bbcabf]/20'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alert Configuration Card */}
      <div className="bg-[#f0f3ff] p-4 rounded-xl flex items-start gap-3 border border-[#dee8ff]">
        <div className="w-10 h-10 rounded-full bg-[#ffdcc5]/60 flex items-center justify-center shrink-0 text-[#944a00]">
          <span className="material-symbols-outlined text-[20px]">notifications_active</span>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#111c2d]">Alerta de límite al 80%</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alertAt80}
                onChange={(e) => setAlertAt80(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006c49]"></div>
            </label>
          </div>
          <p className="text-xs text-[#3c4a42] leading-relaxed">
            Te avisaremos con una notificación Push cuando alcances los {formatCLP(alertThreshold, true)} gastados hoy para evitar sorpresas.
          </p>
        </div>
      </div>

      {/* Live Preview Widget */}
      <div className="bg-white p-4 rounded-xl border border-[#bbcabf]/30 flex flex-col gap-2.5 shadow-2xs">
        <div className="flex justify-between items-center text-xs text-[#3c4a42]">
          <span className="font-semibold uppercase tracking-wider">
            Vista previa en Dashboard
          </span>
          <span className="text-[#006c49] font-bold">Restante estimado</span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-xl font-bold text-[#111c2d]">
            {formatCLP(remainingPreview)}{' '}
            <span className="text-xs font-normal text-[#3c4a42]">CLP</span>
          </span>
          <span className="text-xs text-[#944a00] bg-[#ffdcc5]/40 px-2 py-0.5 rounded font-medium">
            Gastado hoy: {formatCLP(spentToday)}
          </span>
        </div>

        <div className="w-full bg-[#e7eeff] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#006c49] h-full rounded-full transition-all duration-300"
            style={{ width: `${percentUsed}%` }}
          ></div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          id="btn-guardar-presupuesto"
          onClick={handleSave}
          disabled={isSaved}
          className={`w-full py-3.5 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
            isSaved
              ? 'bg-[#006c49] text-white'
              : 'bg-[#10b981] hover:bg-[#006c49] text-[#00422b] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isSaved ? 'done' : 'check_circle'}
          </span>
          <span>{isSaved ? '¡Presupuesto Actualizado!' : 'Guardar Presupuesto'}</span>
        </button>

        <button
          onClick={() => onNavigate('dashboard')}
          className="w-full mt-2 py-2 text-xs text-[#3c4a42] hover:text-[#111c2d] text-center font-medium"
        >
          Cancelar y volver al Dashboard
        </button>
      </div>
    </main>
  );
};
