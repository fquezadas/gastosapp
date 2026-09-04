import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatCLP } from '../utils/formatters';

interface AllTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export const AllTransactionsModal: React.FC<AllTransactionsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onDeleteTransaction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  if (!isOpen) return null;

  const filtered = transactions.filter((tx) => {
    if (selectedCategory === 'todos') return true;
    return tx.category === selectedCategory;
  });

  const totalFiltered = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  const getCategoryIcon = (category: Transaction['category']) => {
    switch (category) {
      case 'cafe':
        return { icon: 'coffee', bg: 'bg-[#10b981]/20', text: 'text-[#006c49]' };
      case 'snacks':
        return { icon: 'bakery_dining', bg: 'bg-[#ffdcc5]/60', text: 'text-[#944a00]' };
      case 'transporte':
        return { icon: 'directions_bus', bg: 'bg-[#dee8ff]', text: 'text-[#111c2d]' };
      case 'bebidas':
        return { icon: 'local_cafe', bg: 'bg-[#6ffbbe]/30', text: 'text-[#006c49]' };
      case 'antojos':
        return { icon: 'cookie', bg: 'bg-[#ffdcc5]/60', text: 'text-[#944a00]' };
      case 'otros':
      default:
        return { icon: 'shopping_bag', bg: 'bg-[#dee8ff]', text: 'text-[#111c2d]' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] border border-[#e7eeff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f3ff]">
          <div>
            <h3 className="font-bold text-lg text-[#111c2d]">Historial de Movimientos</h3>
            <p className="text-xs text-[#3c4a42]">
              {filtered.length} transacciones • Total {formatCLP(totalFiltered, true)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f0f3ff] text-[#3c4a42]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 py-3 overflow-x-auto scrollbar-none">
          {['todos', 'cafe', 'snacks', 'transporte', 'bebidas', 'antojos', 'otros'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#006c49] text-white'
                  : 'bg-[#dee8ff] text-[#111c2d] hover:bg-[#d8e3fb]'
              }`}
            >
              {cat === 'todos'
                ? 'Todos'
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto py-2 space-y-2.5 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-[#3c4a42]">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">receipt_long</span>
              <p className="text-sm">No hay movimientos en esta categoría</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const meta = getCategoryIcon(tx.category);
              return (
                <div
                  key={tx.id}
                  className="bg-white p-3.5 rounded-xl shadow-xs border border-[#e7eeff] flex items-center justify-between hover:bg-[#f0f3ff] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center`}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {meta.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[#111c2d]">{tx.title}</h4>
                      <p className="text-xs text-[#3c4a42]">
                        {tx.place} • {tx.time} ({tx.date})
                      </p>
                      {tx.notes && (
                        <p className="text-[11px] text-gray-400 mt-0.5 italic">{tx.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold text-sm text-[#ba1a1a]">
                        -{formatCLP(tx.amount)}
                      </span>
                      <p className="text-[11px] text-[#3c4a42]">CLP</p>
                    </div>
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Eliminar movimiento"
                      className="p-1 text-gray-300 hover:text-[#ba1a1a] transition-colors rounded"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 bg-[#006c49] hover:bg-[#005236] text-white font-semibold text-sm rounded-xl transition-all"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};
