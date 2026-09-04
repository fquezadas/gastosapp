import React, { useState } from 'react';
import { Transaction, ScreenTab } from '../../types';
import { formatCLP } from '../../utils/formatters';

interface StatsScreenProps {
  transactions: Transaction[];
  onNavigate: (tab: ScreenTab) => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ transactions, onNavigate }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Marzo');
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState<boolean>(false);

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril'];

  // Calculate totals from transactions or fallback
  const totalAmount = transactions.length > 0
    ? transactions.reduce((acc, t) => acc + t.amount, 0)
    : 142500;

  const cafeTotal = transactions
    .filter((t) => t.category === 'cafe' || t.category === 'bebidas')
    .reduce((acc, t) => acc + t.amount, 0) || 64000;

  const snacksTotal = transactions
    .filter((t) => t.category === 'snacks' || t.category === 'antojos')
    .reduce((acc, t) => acc + t.amount, 0) || 42500;

  const otrosTotal = transactions
    .filter((t) => t.category === 'transporte' || t.category === 'otros')
    .reduce((acc, t) => acc + t.amount, 0) || 36000;

  const cafePct = Math.round((cafeTotal / (totalAmount || 1)) * 100) || 45;
  const snacksPct = Math.round((snacksTotal / (totalAmount || 1)) * 100) || 30;
  const otrosPct = Math.max(0, 100 - cafePct - snacksPct);

  return (
    <main className="px-4 py-3 max-w-lg mx-auto flex flex-col gap-5 pb-28 animate-in fade-in duration-200">
      {/* Page Title & Period Selector */}
      <section className="flex justify-between items-center relative">
        <div>
          <h1 className="text-2xl font-bold text-[#111c2d]">Estadísticas</h1>
          <p className="text-xs text-[#3c4a42] mt-0.5">Resumen de micro-gastos del mes (CLP)</p>
        </div>

        <button
          onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
          className="bg-[#f0f3ff] hover:bg-[#dee8ff] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-sm font-bold text-[#006c49] transition-colors shadow-2xs"
        >
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          <span>{selectedMonth}</span>
        </button>

        {/* Dropdown for month */}
        {isMonthPickerOpen && (
          <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-[#e7eeff] p-1 z-20 min-w-32">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(m);
                  setIsMonthPickerOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  selectedMonth === m
                    ? 'bg-[#10b981] text-[#00422b] font-bold'
                    : 'text-[#111c2d] hover:bg-[#f0f3ff]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Monthly Summary Bento Card */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-[#e7eeff] flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-[#3c4a42] uppercase tracking-wider">
              Total Gastado
            </span>
            <h2 className="text-4xl font-bold text-[#111c2d] mt-1 tracking-tight">
              {formatCLP(totalAmount, true)}
            </h2>
          </div>
          <div className="bg-[#ffdad6] text-[#93000a] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12% vs. mes ant.</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#f0f3ff]">
          <div className="flex flex-col">
            <span className="text-xs text-[#3c4a42]">Café y Beb.</span>
            <span className="text-base font-bold text-[#111c2d]">{formatCLP(cafeTotal)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[#3c4a42]">Snacks</span>
            <span className="text-base font-bold text-[#111c2d]">{formatCLP(snacksTotal)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[#3c4a42]">Otros / Transp.</span>
            <span className="text-base font-bold text-[#111c2d]">{formatCLP(otrosTotal)}</span>
          </div>
        </div>
      </section>

      {/* Category Breakdown Card */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-[#e7eeff] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#111c2d]">Desglose por Categoría</h3>
          <span className="text-xs text-[#006c49] font-bold">Gastos Hormiga</span>
        </div>

        {/* Visual Progress Bar Breakdown */}
        <div className="flex flex-col gap-3">
          <div className="w-full h-4 bg-[#e7eeff] rounded-full overflow-hidden flex shadow-2xs">
            <div
              className="bg-[#006c49] h-full transition-all duration-500"
              style={{ width: `${cafePct}%` }}
              title={`Café y Bebidas ${cafePct}%`}
            ></div>
            <div
              className="bg-[#fd933d] h-full transition-all duration-500"
              style={{ width: `${snacksPct}%` }}
              title={`Snacks ${snacksPct}%`}
            ></div>
            <div
              className="bg-[#a0a3a5] h-full transition-all duration-500"
              style={{ width: `${otrosPct}%` }}
              title={`Otros ${otrosPct}%`}
            ></div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="flex items-start gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#006c49] mt-1 shrink-0"></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#111c2d]">Café</span>
                <span className="text-[11px] text-[#3c4a42]">{cafePct}% ({formatCLP(cafeTotal)})</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#fd933d] mt-1 shrink-0"></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#111c2d]">Snacks</span>
                <span className="text-[11px] text-[#3c4a42]">{snacksPct}% ({formatCLP(snacksTotal)})</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#a0a3a5] mt-1 shrink-0"></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#111c2d]">Otros</span>
                <span className="text-[11px] text-[#3c4a42]">{otrosPct}% ({formatCLP(otrosTotal)})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Insights Section */}
      <section className="bg-[#f0f3ff] p-5 rounded-2xl flex flex-col gap-3.5 border border-[#dee8ff]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#10b981] text-[#00422b] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[22px]">lightbulb</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111c2d]">Recomendaciones Inteligentes</h3>
            <p className="text-xs text-[#3c4a42]">Basado en tus hábitos de consumo</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="bg-white p-4 rounded-xl flex items-start gap-3 shadow-2xs border border-[#e7eeff] hover:border-emerald-200 transition-colors">
            <span className="material-symbols-outlined text-[#006c49] mt-0.5 text-[20px]">
              local_cafe
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#111c2d]">
                Prepara café en casa 3 días a la semana
              </span>
              <p className="text-xs text-[#3c4a42] mt-1 leading-relaxed">
                Podrías ahorrar hasta $28.000 CLP mensuales evitando compras impulsivas por la mañana.
              </p>
              <button
                onClick={() => onNavigate('savings')}
                className="mt-2 text-xs font-bold text-[#006c49] hover:underline self-start flex items-center gap-1"
              >
                Ver retos de ahorro relacionados →
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl flex items-start gap-3 shadow-2xs border border-[#e7eeff] hover:border-orange-200 transition-colors">
            <span className="material-symbols-outlined text-[#944a00] mt-0.5 text-[20px]">
              shopping_bag
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#111c2d]">
                Cuidado con los antojos de tarde
              </span>
              <p className="text-xs text-[#3c4a42] mt-1 leading-relaxed">
                El 70% de tus gastos en snacks ocurren entre las 3:00 PM y 5:00 PM.
              </p>
              <button
                onClick={() => onNavigate('savings')}
                className="mt-2 text-xs font-bold text-[#006c49] hover:underline self-start flex items-center gap-1"
              >
                Activar reto 7 días sin antojos →
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
