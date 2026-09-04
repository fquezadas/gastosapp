import React, { useState } from 'react';
import { Transaction, ScreenTab } from '../../types';

interface AddExpenseScreenProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onNavigate: (tab: ScreenTab) => void;
}

export const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({
  onAddTransaction,
  onNavigate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const [amountInput, setAmountInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Transaction['category']>('cafe');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateMode, setDateMode] = useState<'hoy' | 'ayer' | 'custom'>('hoy');
  const [note, setNote] = useState<string>('');
  const [place, setPlace] = useState<string>('Cafetería Local');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const categories = [
    { id: 'cafe' as const, label: 'Café', emoji: '☕', defaultPlace: 'Cafetería Local' },
    { id: 'snacks' as const, label: 'Snacks', emoji: '🍪', defaultPlace: 'Almacén de barrio' },
    { id: 'bebidas' as const, label: 'Bebidas', emoji: '🧃', defaultPlace: 'Kiosco' },
    { id: 'antojos' as const, label: 'Antojos', emoji: '🍩', defaultPlace: 'Panadería' },
    { id: 'transporte' as const, label: 'Transporte', emoji: '🚌', defaultPlace: 'Metro / Micro' },
    { id: 'otros' as const, label: 'Otros', emoji: '🛍️', defaultPlace: 'Comercio varios' },
  ];

  const handleCategorySelect = (cat: Transaction['category']) => {
    setSelectedCategory(cat);
    const found = categories.find((c) => c.id === cat);
    if (found) {
      setPlace(found.defaultPlace);
    }
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseInt(amountInput.replace(/\D/g, ''), 10) || 0;
    setAmountInput(String(current + addValue));
  };

  const handleDateModeChange = (mode: 'hoy' | 'ayer' | 'custom') => {
    setDateMode(mode);
    if (mode === 'hoy') {
      setSelectedDate(todayStr);
    } else if (mode === 'ayer') {
      setSelectedDate(yesterdayStr);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amountInput.replace(/\D/g, ''), 10);
    if (!num || num <= 0) {
      alert('Por favor ingresa un monto válido.');
      return;
    }

    const categoryObj = categories.find((c) => c.id === selectedCategory);
    const now = new Date();
    const isChosenToday = selectedDate === todayStr;

    let timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (!isChosenToday) {
      timeStr = selectedDate === yesterdayStr ? 'Ayer' : selectedDate;
    }

    onAddTransaction({
      title: note.trim() || `${categoryObj?.label || 'Gasto'} rápido`,
      place: place || 'Comercio local',
      time: timeStr,
      category: selectedCategory,
      amount: num,
      date: selectedDate,
      isToday: isChosenToday,
      notes: note.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      onNavigate('dashboard');
    }, 700);
  };

  return (
    <main className="max-w-md mx-auto px-4 pt-3 pb-28 animate-in fade-in duration-200">
      {/* Header Title Section */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111c2d]">Gasto Rápido</h1>
        <p className="text-xs text-[#3c4a42] mt-0.5">
          Registra tus micro-gastos y mantén tu presupuesto al día (CLP).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Amount Input Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e7eeff]">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3c4a42] mb-1.5">
            Monto del Gasto (CLP)
          </label>
          <div className="relative flex items-center">
            <span className="text-4xl font-bold text-[#006c49] mr-2">$</span>
            <input
              id="monto-input"
              autoFocus
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setAmountInput(raw);
              }}
              placeholder="0"
              className="w-full text-4xl font-bold bg-transparent border-none p-0 text-[#111c2d] focus:ring-0 focus:outline-none placeholder:text-[#bbcabf]"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex gap-2 mt-3.5 pt-3 border-t border-[#f0f3ff]">
            <button
              type="button"
              onClick={() => handleQuickAddAmount(1000)}
              className="text-xs bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#006c49] font-semibold py-1.5 px-3 rounded-lg transition-colors"
            >
              +$1.000
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddAmount(2000)}
              className="text-xs bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#006c49] font-semibold py-1.5 px-3 rounded-lg transition-colors"
            >
              +$2.000
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddAmount(5000)}
              className="text-xs bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#006c49] font-semibold py-1.5 px-3 rounded-lg transition-colors"
            >
              +$5.000
            </button>
            <button
              type="button"
              onClick={() => setAmountInput('')}
              className="text-xs text-[#3c4a42] hover:text-[#ba1a1a] ml-auto py-1.5 px-2 transition-colors"
            >
              Borrar
            </button>
          </div>
        </div>

        {/* Date Selection Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e7eeff] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c49] text-[20px]">calendar_today</span>
              <span className="text-xs font-semibold text-[#3c4a42] uppercase tracking-wider">Fecha del gasto</span>
            </div>
            <span className="text-xs font-bold text-[#006c49]">
              {selectedDate === todayStr ? 'Hoy' : selectedDate === yesterdayStr ? 'Ayer' : selectedDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDateModeChange('hoy')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                dateMode === 'hoy'
                  ? 'bg-[#006c49] text-white shadow-2xs'
                  : 'bg-[#f0f3ff] text-[#111c2d] hover:bg-[#dee8ff]'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => handleDateModeChange('ayer')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                dateMode === 'ayer'
                  ? 'bg-[#006c49] text-white shadow-2xs'
                  : 'bg-[#f0f3ff] text-[#111c2d] hover:bg-[#dee8ff]'
              }`}
            >
              Ayer
            </button>
            <button
              type="button"
              onClick={() => handleDateModeChange('custom')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                dateMode === 'custom'
                  ? 'bg-[#006c49] text-white shadow-2xs'
                  : 'bg-[#f0f3ff] text-[#111c2d] hover:bg-[#dee8ff]'
              }`}
            >
              Otra fecha
            </button>
          </div>

          {dateMode === 'custom' && (
            <div className="mt-1">
              <input
                type="date"
                max={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#f9f9ff] border border-[#dee8ff] text-[#111c2d] text-xs rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-[#006c49] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#3c4a42] mb-2">
            Categoría
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-white border-2 border-[#006c49] shadow-sm text-[#006c49]'
                      : 'bg-[#f0f3ff] hover:bg-[#dee8ff] border-2 border-transparent text-[#111c2d]'
                  }`}
                >
                  <span className="text-2xl mb-1">{cat.emoji}</span>
                  <span className={`text-xs ${isSelected ? 'font-bold text-[#006c49]' : 'font-medium text-[#111c2d]'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Note & Place Input */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e7eeff] flex flex-col gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-[#3c4a42] mb-1">
              Comercio / Lugar
            </label>
            <input
              id="lugar-input"
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Ej. Cafetería, Almacén, etc."
              className="w-full text-xs bg-[#f9f9ff] border border-[#dee8ff] rounded-xl p-2 text-[#111c2d] focus:ring-1 focus:ring-[#006c49] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#3c4a42] mb-1">
              Nota o detalle (opcional)
            </label>
            <input
              id="nota-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. Café con leche y medialuna"
              className="w-full text-xs bg-[#f9f9ff] border border-[#dee8ff] rounded-xl p-2 text-[#111c2d] focus:ring-1 focus:ring-[#006c49] focus:outline-none"
            />
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          id="btn-guardar-gasto"
          type="submit"
          disabled={isSuccess}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-1 ${
            isSuccess
              ? 'bg-[#10b981] text-[#00422b]'
              : 'bg-[#006c49] text-white hover:bg-[#005236]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isSuccess ? 'done_all' : 'check'}
          </span>
          <span>{isSuccess ? '¡Gasto Guardado!' : 'Guardar Gasto'}</span>
        </button>
      </form>
    </main>
  );
};
