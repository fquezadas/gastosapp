import React from 'react';
import { ScreenTab } from '../types';

interface BottomNavProps {
  currentTab: ScreenTab;
  onNavigate: (tab: ScreenTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const tabs = [
    { id: 'dashboard' as ScreenTab, label: 'Dashboard', icon: 'home' },
    { id: 'add' as ScreenTab, label: 'Add', icon: 'add_circle' },
    { id: 'stats' as ScreenTab, label: 'Stats', icon: 'pie_chart' },
    { id: 'savings' as ScreenTab, label: 'Savings', icon: 'savings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-4 py-2 shadow-lg bg-[#f0f3ff] border-t border-[#e7eeff] max-w-lg mx-auto md:rounded-t-2xl">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-[0.96] ${
              isActive
                ? 'bg-[#10b981] text-[#00422b] rounded-2xl px-4 py-1.5 shadow-sm'
                : 'text-[#3c4a42] hover:bg-[#dee8ff] hover:text-[#111c2d] px-3 py-1.5 rounded-2xl'
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
            <span className={`text-xs mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
