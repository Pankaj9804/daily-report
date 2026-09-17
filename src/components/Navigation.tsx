import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  FileEdit,
  Clock,
  BarChart3,
  Settings,
  GraduationCap,
  Moon,
  Sun
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ProfessorProfile } from '../types';

export type ActiveTab = 'dashboard' | 'calendar' | 'daily-entry' | 'timetable' | 'reports' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: ProfessorProfile;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  profile,
  darkMode,
  setDarkMode
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as ActiveTab, label: 'Calendar', icon: CalendarIcon },
    { id: 'daily-entry' as ActiveTab, label: 'Daily Entry', icon: FileEdit },
    { id: 'timetable' as ActiveTab, label: 'Timetable', icon: Clock },
    { id: 'reports' as ActiveTab, label: 'Reports & Export', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 shrink-0 select-none">
      {/* College & App Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-900/40 text-white shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white truncate">
              Academic Diary
            </h1>
            <p className="text-xs text-blue-300/80 truncate font-medium">
              Daily Activity Report
            </p>
          </div>
        </div>

        {/* Professor Card */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <p className="text-xs font-semibold text-slate-200 truncate">{profile.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{profile.designation}, {profile.department}</p>
          <p className="text-[10px] text-blue-400 font-medium truncate mt-0.5">{profile.college}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer controls: PWA Install & Theme Switch */}
      <div className="p-3.5 border-t border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Appearance</span>
          <button
            id="theme-toggle-btn"
            onClick={() => setDarkMode(prev => !prev)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
        <div className="pt-1">
          <PWAInstallButton />
        </div>
      </div>
    </aside>
  );
};

export const MobileBottomNav: React.FC<{
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: LayoutDashboard },
    { id: 'calendar' as ActiveTab, label: 'Calendar', icon: CalendarIcon },
    { id: 'daily-entry' as ActiveTab, label: 'Entry', icon: FileEdit },
    { id: 'timetable' as ActiveTab, label: 'Timetable', icon: Clock },
    { id: 'reports' as ActiveTab, label: 'Reports', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Profile', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] px-2 flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition active:scale-90 ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.7]'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
