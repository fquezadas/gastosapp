import React from 'react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] border border-[#e7eeff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c49]">notifications</span>
            <h3 className="font-bold text-lg text-[#111c2d]">Notificaciones</h3>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-[#3c4a42] hover:text-[#ba1a1a] transition-colors"
              >
                Limpiar
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f0f3ff] text-[#3c4a42]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto py-3 space-y-2.5 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-[#3c4a42]">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">notifications_off</span>
              <p className="text-sm">No tienes notificaciones pendientes</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                  notif.read
                    ? 'bg-[#f9f9ff] border-[#e7eeff] opacity-75'
                    : 'bg-[#f0f3ff] border-[#dee8ff]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === 'challenge'
                      ? 'bg-[#10b981]/20 text-[#006c49]'
                      : notif.type === 'alert'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#ffdcc5] text-[#944a00]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {notif.type === 'challenge'
                      ? 'trophy'
                      : notif.type === 'alert'
                      ? 'warning'
                      : 'lightbulb'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-semibold text-[#111c2d] truncate">{notif.title}</h4>
                    <span className="text-[10px] text-[#3c4a42] shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-[#3c4a42] mt-0.5 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 bg-[#f0f3ff] hover:bg-[#e7eeff] text-[#006c49] font-semibold text-sm rounded-xl transition-all"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
