import React, { useState } from 'react';
import { Transaction, BudgetSettings, ScreenTab } from '../../types';
import { formatCLP } from '../../utils/formatters';

interface DashboardScreenProps {
  transactions: Transaction[];
  budget: BudgetSettings;
  onNavigate: (tab: ScreenTab) => void;
  onOpenAllTransactions: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  transactions,
  budget,
  onNavigate,
  onOpenAllTransactions,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [timePeriod, setTimePeriod] = useState<'hoy' | 'semana' | 'mes'>('hoy');

  // Calculate today's micro expenses
  const todayTransactions = transactions.filter((tx) => tx.isToday);
  const spentToday = todayTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Daily budget remaining
  const remainingToday = Math.max(0, budget.dailyLimit - spentToday);
  const progressPercentage = Math.min(100, Math.round((spentToday / budget.dailyLimit) * 100));

  // Filter transactions for the movements list
  const filteredTransactions = transactions.filter((tx) => {
    // Category filter
    if (selectedCategoryFilter !== 'todos') {
      if (selectedCategoryFilter === 'cafe' && !(tx.category === 'cafe' || tx.category === 'bebidas')) return false;
      if (selectedCategoryFilter === 'snacks' && !(tx.category === 'snacks' || tx.category === 'antojos')) return false;
      if (selectedCategoryFilter === 'transporte' && tx.category !== 'transporte') return false;
      if (selectedCategoryFilter === 'otros' && tx.category !== 'otros') return false;
    }

    // Time period filter
    if (timePeriod === 'hoy') {
      return tx.isToday;
    }
    return true;
  });

  const getCategoryMeta = (cat: Transaction['category']) => {
    switch (cat) {
      case 'cafe':
        return {
          icon: 'coffee',
          bg: 'bg-[#10b981]/20',
          text: 'text-[#006c49]',
        };
      case 'snacks':
        return {
          icon: 'bakery_dining',
          bg: 'bg-[#ffdcc5]/70',
          text: 'text-[#944a00]',
        };
      case 'transporte':
        return {
          icon: 'directions_bus',
          bg: 'bg-[#dee8ff]',
          text: 'text-[#111c2d]',
        };
      case 'bebidas':
        return {
          icon: 'local_cafe',
          bg: 'bg-[#6ffbbe]/30',
          text: 'text-[#006c49]',
        };
      case 'antojos':
        return {
          icon: 'cookie',
          bg: 'bg-[#ffdcc5]/60',
          text: 'text-[#944a00]',
        };
      case 'otros':
      default:
        return {
          icon: 'shopping_bag',
          bg: 'bg-[#e7eeff]',
          text: 'text-[#006c49]',
        };
    }
  };

  return (
    <main className="px-4 py-3 max-w-xl mx-auto flex flex-col gap-5 pb-24 animate-in fade-in duration-200">
      {/* Greeting & Summary Card */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#e7eeff] flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#10b981]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm font-medium text-[#3c4a42]">Gastos hormiga hoy</span>
            <h2 className="text-4xl font-bold text-[#111c2d] mt-1 tracking-tight">
              {formatCLP(spentToday)}{' '}
              <span className="text-base text-[#3c4a42] font-normal">CLP</span>
            </h2>
          </div>

          <button
            onClick={() => onNavigate('budget')}
            className="px-3 py-1.5 bg-[#ffdad6] hover:bg-[#ffdad6]/80 text-[#93000a] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-[0.98]"
            title="Ver configuración de presupuesto"
          >
            <span className="material-symbols-outlined text-[16px]">trending_down</span>
            <span>Presupuesto activo</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-[#3c4a42]">
            <span>Restante del día</span>
            <span className="font-bold text-[#006c49]">
              {formatCLP(remainingToday, true)}
            </span>
          </div>
          <div className="w-full bg-[#e7eeff] h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-[#10b981] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button: Agregar Gasto Rápido */}
        <button
          id="btn-agregar-gasto-rapido"
          onClick={() => onNavigate('add')}
          className="mt-1 w-full bg-[#10b981] hover:bg-[#006c49] text-[#00422b] hover:text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            add_circle
          </span>
          <span>Agregar Gasto Rápido</span>
        </button>
      </section>

      {/* Quick Micro-Categories Filter Chips */}
      <section className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryFilter('todos')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-xs ${
            selectedCategoryFilter === 'todos'
              ? 'bg-[#006c49] text-white'
              : 'bg-[#dee8ff] text-[#111c2d] hover:bg-[#d8e3fb]'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setSelectedCategoryFilter('cafe')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-xs ${
            selectedCategoryFilter === 'cafe'
              ? 'bg-[#006c49] text-white'
              : 'bg-[#dee8ff] text-[#111c2d] hover:bg-[#d8e3fb]'
          }`}
        >
          Café y Bebidas
        </button>
        <button
          onClick={() => setSelectedCategoryFilter('snacks')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-xs ${
            selectedCategoryFilter === 'snacks'
              ? 'bg-[#006c49] text-white'
              : 'bg-[#dee8ff] text-[#111c2d] hover:bg-[#d8e3fb]'
          }`}
        >
          Snacks y Antojos
        </button>
        <button
          onClick={() => setSelectedCategoryFilter('transporte')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-xs ${
            selectedCategoryFilter === 'transporte'
              ? 'bg-[#006c49] text-white'
              : 'bg-[#dee8ff] text-[#111c2d] hover:bg-[#d8e3fb]'
          }`}
        >
          Transporte
        </button>
        <button
          onClick={() => setSelectedCategoryFilter('otros')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-xs ${
            selectedCategoryFilter === 'otros'
              ? 'bg-[#006c49] text-white'
              : 'bg-[#dee8ff] text-[#111c2d] hover:bg-[#d8e3fb]'
          }`}
        >
          Otros
        </button>
      </section>

      {/* Time Period Selector */}
      <section className="flex gap-1 bg-[#dee8ff] p-1 rounded-xl">
        <button
          onClick={() => setTimePeriod('hoy')}
          className={`flex-1 py-1.5 rounded-lg text-sm font-semibold text-center transition-all ${
            timePeriod === 'hoy'
              ? 'bg-white text-[#111c2d] shadow-xs'
              : 'text-[#3c4a42] hover:text-[#111c2d]'
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setTimePeriod('semana')}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium text-center transition-all ${
            timePeriod === 'semana'
              ? 'bg-white text-[#111c2d] shadow-xs'
              : 'text-[#3c4a42] hover:text-[#111c2d]'
          }`}
        >
          Semana
        </button>
        <button
          onClick={() => setTimePeriod('mes')}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium text-center transition-all ${
            timePeriod === 'mes'
              ? 'bg-white text-[#111c2d] shadow-xs'
              : 'text-[#3c4a42] hover:text-[#111c2d]'
          }`}
        >
          Mes
        </button>
      </section>

      {/* Detailed Movements List */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#111c2d]">Últimos movimientos</h3>
          <button
            onClick={onOpenAllTransactions}
            className="text-sm text-[#006c49] font-bold hover:underline cursor-pointer"
          >
            Ver todos
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-[#e7eeff] text-center text-[#3c4a42]">
              <span className="material-symbols-outlined text-3xl text-gray-300 mb-1">receipt_long</span>
              <p className="text-sm">No hay movimientos registrados para este filtro</p>
            </div>
          ) : (
            filteredTransactions.slice(0, 5).map((tx) => {
              const meta = getCategoryMeta(tx.category);
              return (
                <div
                  key={tx.id}
                  className="bg-white p-4 rounded-xl shadow-xs border border-[#e7eeff] flex items-center justify-between hover:bg-[#f0f3ff] transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0`}
                    >
                      <span
                        className="material-symbols-outlined text-[24px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {meta.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#111c2d] leading-tight">
                        {tx.title}
                      </h4>
                      <p className="text-xs text-[#3c4a42] mt-0.5">
                        {tx.place} • {tx.time}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-bold text-[#ba1a1a]">
                      -{formatCLP(tx.amount)}
                    </span>
                    <p className="text-xs text-[#3c4a42]">CLP</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};
