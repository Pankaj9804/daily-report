import React, { useState, useEffect, useMemo } from 'react';
import {
  getDailyRecords,
  saveDailyRecord,
  deleteDailyRecord,
  getProfessorProfile,
  saveProfessorProfile,
  getAcademicSettings,
  saveAcademicSettings,
  getTimetable,
  saveTimetable,
  calculateMonthlyStats,
  resetToSampleData,
  exportFullBackupJSON,
  importFullBackupJSON
} from './services/storageService';
import {
  DailyRecord,
  ProfessorProfile,
  AcademicSettings,
  TimetableEntry
} from './types';
import { Sidebar, MobileBottomNav, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { DailyEntryView } from './components/DailyEntryView';
import { TimetableManager } from './components/TimetableManager';
import { MonthlyReportView } from './components/MonthlyReportView';
import { SettingsView } from './components/SettingsView';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { GraduationCap, Sun, Moon, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation & Date State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Default to September 17, 2026 for the Professor's academic diary
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-09-17');
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-17');
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Persistence State
  const [dailyRecordsMap, setDailyRecordsMap] = useState<Record<string, DailyRecord>>({});
  const [profile, setProfile] = useState<ProfessorProfile>(getProfessorProfile());
  const [academicSettings, setAcademicSettings] = useState<AcademicSettings>(getAcademicSettings());
  const [timetable, setTimetableState] = useState<TimetableEntry[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('academic_diary_theme') === 'dark';
  });

  // Apply dark mode class to HTML root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('academic_diary_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('academic_diary_theme', 'light');
    }
  }, [darkMode]);

  // Load initial data from localStorage
  const loadAllData = () => {
    setDailyRecordsMap(getDailyRecords());
    setProfile(getProfessorProfile());
    setAcademicSettings(getAcademicSettings());
    setTimetableState(getTimetable());
  };

  useEffect(() => {
    loadAllData();

    // Check for Android App Launcher shortcuts (e.g., /?tab=daily-entry)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab | null;
      if (tabParam && ['dashboard', 'calendar', 'daily-entry', 'timetable', 'reports', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Compute records array
  const dailyRecordsArray = useMemo(() => {
    return Object.values(dailyRecordsMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyRecordsMap]);

  // Filter records for selected month & year
  const currentMonthRecords = useMemo(() => {
    const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    return dailyRecordsArray.filter(r => r.date.startsWith(prefix));
  }, [dailyRecordsArray, selectedYear, selectedMonth]);

  // Monthly summary stats
  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(selectedYear, selectedMonth, dailyRecordsMap);
  }, [selectedYear, selectedMonth, dailyRecordsMap]);

  // Scheduled classes for today (based on day of week)
  const scheduledClassesToday = useMemo(() => {
    const dateObj = new Date(currentDateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ...
    return timetable.filter(t => t.dayOfWeek === dayOfWeek);
  }, [currentDateStr, timetable]);

  // Scheduled classes for the selected entry date
  const scheduledClassesForSelectedDate = useMemo(() => {
    const dateObj = new Date(selectedDateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    return timetable.filter(t => t.dayOfWeek === dayOfWeek);
  }, [selectedDateStr, timetable]);

  // Today's record
  const todayRecord = dailyRecordsMap[currentDateStr] || null;
  // Selected date record
  const selectedDateRecord = dailyRecordsMap[selectedDateStr] || null;

  // Handlers
  const handleSaveRecord = (rec: DailyRecord) => {
    saveDailyRecord(rec);
    setDailyRecordsMap(prev => ({
      ...prev,
      [rec.date]: rec,
    }));
  };

  const handleDeleteRecord = (dateStr: string) => {
    deleteDailyRecord(dateStr);
    setDailyRecordsMap(prev => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
  };

  const handleSaveTimetable = (newTimetable: TimetableEntry[]) => {
    saveTimetable(newTimetable);
    setTimetableState(newTimetable);
  };

  const handleSaveProfile = (newProfile: ProfessorProfile) => {
    saveProfessorProfile(newProfile);
    setProfile(newProfile);
  };

  const handleSaveSettings = (newSettings: AcademicSettings) => {
    saveAcademicSettings(newSettings);
    setAcademicSettings(newSettings);
  };

  const handleNavigateToDate = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const d = new Date(dateStr + 'T00:00:00');
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth() + 1);
    setActiveTab('daily-entry');
  };

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-diary-backup-${currentDateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (content: string) => {
    const success = importFullBackupJSON(content);
    if (success) {
      loadAllData();
    }
    return success;
  };

  // Reset to Sample Data
  const handleResetSampleData = () => {
    resetToSampleData();
    loadAllData();
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Academic Diary
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {profile.name} • {profile.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <PWAInstallButton variant="compact" />
            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Toggle Appearance"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Scrollable Viewport Container */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentDateStr={currentDateStr}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              stats={monthlyStats}
              profile={profile}
              todayRecord={todayRecord}
              scheduledClassesToday={scheduledClassesToday}
              recentRecords={dailyRecordsArray.slice().reverse()}
              onNavigateToDate={handleNavigateToDate}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              currentDateStr={currentDateStr}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={handleMonthChange}
              dailyRecordsMap={dailyRecordsMap}
              onSelectDate={handleNavigateToDate}
            />
          )}

          {activeTab === 'daily-entry' && (
            <DailyEntryView
              selectedDateStr={selectedDateStr}
              onDateChange={setSelectedDateStr}
              record={selectedDateRecord}
              academicSettings={academicSettings}
              scheduledClassesForDay={scheduledClassesForSelectedDate}
              onSaveRecord={handleSaveRecord}
              onDeleteRecord={handleDeleteRecord}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableManager
              timetable={timetable}
              academicSettings={academicSettings}
              onSaveTimetable={handleSaveTimetable}
            />
          )}

          {activeTab === 'reports' && (
            <MonthlyReportView
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={handleMonthChange}
              profile={profile}
              stats={monthlyStats}
              records={currentMonthRecords}
              onNavigateToDate={handleNavigateToDate}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              profile={profile}
              academicSettings={academicSettings}
              onSaveProfile={handleSaveProfile}
              onSaveSettings={handleSaveSettings}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetSampleData={handleResetSampleData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Network / Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}
