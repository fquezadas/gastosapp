import React from 'react';
import { USER_AVATAR } from '../data/mockData';
import { ScreenTab } from '../types';

interface HeaderProps {
  currentTab: ScreenTab;
  onNavigate: (tab: ScreenTab) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenNotifications,
  unreadNotificationsCount,
}) => {
  return (
    <header className="bg-[#f9f9ff] flex justify-between items-center w-full px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div
          onClick={() => onNavigate('dashboard')}
          className="w-10 h-10 rounded-full overflow-hidden bg-[#dee8ff] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity border-2 border-emerald-500/20"
        >
          <img
            src={USER_AVATAR}
            alt="Usuario GastosApp"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div onClick={() => onNavigate('dashboard')} className="cursor-pointer">
          {currentTab === 'dashboard' ? (
            <>
              <p className="text-xs text-[#3c4a42] leading-tight">Hola de nuevo,</p>
              <span className="text-xl font-bold text-[#006c49] leading-tight">GastosApp</span>
            </>
          ) : (
            <span className="text-xl font-bold text-[#006c49]">GastosApp</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Settings button to access Daily Budget configuration */}
        <button
          id="header-settings-btn"
          onClick={() => onNavigate('budget')}
          title="Ajustes de Presupuesto"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            currentTab === 'budget'
              ? 'bg-[#dee8ff] text-[#006c49]'
              : 'text-[#3c4a42] hover:bg-[#e7eeff] hover:text-[#111c2d]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

        {/* Notifications button */}
        <button
          id="header-notifications-btn"
          onClick={onOpenNotifications}
          title="Notificaciones"
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#3c4a42] hover:bg-[#e7eeff] hover:text-[#111c2d] transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
          )}
        </button>
      </div>
    </header>
  );
};
