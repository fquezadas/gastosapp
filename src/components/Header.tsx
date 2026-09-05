import React, { useState, useRef, useEffect } from 'react';
import { USER_AVATAR } from '../data/mockData';
import { ScreenTab, UserProfile } from '../types';

interface HeaderProps {
  currentTab: ScreenTab;
  user: UserProfile | null;
  onNavigate: (tab: ScreenTab) => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
  unreadNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  user,
  onNavigate,
  onOpenNotifications,
  onLogout,
  unreadNotificationsCount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarSrc = user?.avatarUrl || USER_AVATAR;
  const displayName = user?.name ? user.name.split(' ')[0] : 'GastosApp';

  return (
    <header className="bg-[#f9f9ff] flex justify-between items-center w-full px-4 py-3 sticky top-0 z-40 border-b border-[#e7eeff]/60">
      <div className="flex items-center gap-3">
        {/* User Avatar with Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full overflow-hidden bg-[#dee8ff] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#006c49] transition-all border-2 border-emerald-500/20"
            title="Mi cuenta"
          >
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to default avatar on broken image
                (e.target as HTMLImageElement).src = USER_AVATAR;
              }}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute left-0 top-12 bg-white rounded-2xl shadow-xl border border-[#e7eeff] p-3 z-50 min-w-48 animate-in fade-in zoom-in-95 duration-150">
              <div className="pb-2 mb-2 border-b border-[#f0f3ff]">
                <p className="text-xs font-bold text-[#111c2d] truncate">{user?.name || 'Invitado'}</p>
                <p className="text-[11px] text-[#3c4a42] truncate">{user?.email || 'Modo Demo'}</p>
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onNavigate('budget');
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-[#111c2d] hover:bg-[#f0f3ff] rounded-xl flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-[#006c49]">tune</span>
                <span>Configurar Presupuesto</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl flex items-center gap-2 transition-colors mt-1"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>{user ? 'Cerrar Sesión' : 'Salir del Modo Demo'}</span>
              </button>
            </div>
          )}
        </div>

        <div onClick={() => onNavigate('dashboard')} className="cursor-pointer">
          {currentTab === 'dashboard' ? (
            <>
              <p className="text-[11px] text-[#3c4a42] leading-tight">Hola, {displayName}</p>
              <span className="text-lg font-bold text-[#006c49] leading-tight">GastosApp</span>
            </>
          ) : (
            <span className="text-lg font-bold text-[#006c49]">GastosApp</span>
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
