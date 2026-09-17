import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  BookOpen,
  Award,
  Palmtree,
  ArrowRight,
  Clock,
  Sparkles,
  ClipboardList,
  Smartphone
} from 'lucide-react';
import {
  DailyRecord,
  ProfessorProfile,
  MonthlySummaryStats,
  TimetableEntry
} from '../types';
import { AndroidAppModal } from './AndroidAppModal';

interface DashboardViewProps {
  currentDateStr: string;
  selectedMonth: number; // 1-12
  selectedYear: number;
  stats: MonthlySummaryStats;
  profile: ProfessorProfile;
  todayRecord: DailyRecord | null;
  scheduledClassesToday: TimetableEntry[];
  recentRecords: DailyRecord[];
  onNavigateToDate: (dateStr: string) => void;
  onNavigateTab: (tab: 'calendar' | 'daily-entry' | 'timetable' | 'reports') => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentDateStr,
  selectedMonth,
  selectedYear,
  stats,
  profile,
  todayRecord,
  scheduledClassesToday,
  recentRecords,
  onNavigateToDate,
  onNavigateTab,
}) => {
  const currentDateObj = new Date(currentDateStr + 'T00:00:00');
  const formattedTodayDate = currentDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const monthName = MONTH_NAMES[selectedMonth - 1];
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  // Determine Notification status
  const isTodayRecorded = !!todayRecord;
  const classesAllottedCount = todayRecord?.classes?.filter(c => c.allotted).length ?? scheduledClassesToday.length;
  const classesTakenCount = todayRecord?.classes?.filter(c => c.taken).length ?? 0;
  const classesPendingCount = isTodayRecorded
    ? todayRecord.classes.filter(c => c.allotted && !c.taken && !c.notTakenReason).length
    : scheduledClassesToday.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Prominent Current Date & Quick Greeting */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Academic Session 2026 – 2027</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {formattedTodayDate}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Welcome back, <strong className="text-white">{profile.name}</strong>. Here is your daily teaching and college activity summary for {profile.college}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-dash-today-entry"
              onClick={() => {
                onNavigateToDate(currentDateStr);
                onNavigateTab('daily-entry');
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm shadow-sm transition active:scale-95"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isTodayRecorded ? "Edit Today's Record" : "Record Today's Activity"}</span>
            </button>

            <button
              id="btn-dash-reports"
              onClick={() => onNavigateTab('reports')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition backdrop-blur-xs"
            >
              <span>Monthly Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reminders / Smart Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status of Today's Report */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 transition ${
          isTodayRecorded
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
        }`}>
          {isTodayRecorded ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <h4 className={`text-xs font-bold uppercase tracking-wide ${
              isTodayRecorded ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
            }`}>
              Today's Report Status
            </h4>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
              {isTodayRecorded
                ? `Logged as ${todayRecord.attendanceStatus} (${classesTakenCount}/${classesAllottedCount} classes taken)`
                : "Today's activity report has not been completed yet."}
            </p>
          </div>
        </div>

        {/* Scheduled Classes */}
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wide text-blue-800 dark:text-blue-300">
              Classes Today
            </h4>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
              {scheduledClassesToday.length > 0
                ? `You have ${scheduledClassesToday.length} scheduled classes in your weekly timetable.`
                : 'No recurring classes scheduled for today.'}
            </p>
          </div>
        </div>

        {/* Pending Classes Notification */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 shadow-xs">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Pending Items
            </h4>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
              {classesPendingCount > 0
                ? `${classesPendingCount} classes are pending confirmation.`
                : "All today's class items are up to date."}
            </p>
          </div>
        </div>
      </div>

      {/* Android Mobile App Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 text-white border border-emerald-700/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30 shadow-inner">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">
                Use as Android App on Your Phone
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-semibold border border-emerald-400/30">
                WebAPK & Offline
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5 max-w-xl leading-relaxed">
              Record daily lectures inside classrooms without Wi-Fi. Install directly from Android Chrome with home screen icon, app shortcuts, and instant launch.
            </p>
          </div>
        </div>

        <button
          id="btn-dash-android-install"
          onClick={() => setShowAndroidModal(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition shrink-0 flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Install Android App</span>
        </button>
      </div>

      {/* Quick Summary Cards (Section 3 of User Prompt) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Monthly Summary — {monthName} {selectedYear}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cumulative academic metrics automatically calculated from your daily logs
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5" />
            Auto Updated
          </span>
        </div>

        {/* 8 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Working Days */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Working Days</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.workingDays}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">of {stats.totalDays} total days</p>
          </div>

          {/* Present Days */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Present Days</p>
            <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
              {stats.presentDays}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {stats.leaveDays > 0 ? `${stats.leaveDays} leave` : 'No leaves'}
            </p>
          </div>

          {/* Classes Allotted */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/50">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Classes Allotted</p>
            <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">
              {stats.classesAllotted}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Assigned load</p>
          </div>

          {/* Classes Taken */}
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-800/50">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Classes Taken</p>
            <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-1">
              {stats.classesTaken}
            </p>
            <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
              {stats.classesAllotted > 0
                ? `${((stats.classesTaken / stats.classesAllotted) * 100).toFixed(0)}% completion`
                : '0%'}
            </p>
          </div>

          {/* Classes Not Taken */}
          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/50">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Classes Not Taken</p>
            <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-1">
              {stats.classesNotTaken}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">With reasons recorded</p>
          </div>

          {/* Extra Activities */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Extra Activities</p>
            <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
              {stats.extraActivities}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Meetings, seminars, etc.</p>
          </div>

          {/* Invigilation Duties */}
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/50">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-400">Invigilation Duties</p>
            <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mt-1">
              {stats.invigilationDuties}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Exam duties conducted</p>
          </div>

          {/* Holidays */}
          <div className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-800/40">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Holidays</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {stats.holidays}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Sundays & Vacations</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Today's Class Overview + Recent Daily Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Scheduled Classes for Today */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Classes Scheduled Today
            </h3>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
            >
              Manage Timetable
            </button>
          </div>

          {scheduledClassesToday.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <Palmtree className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No recurring classes on this day
              </p>
              <p className="text-xs text-slate-500 mt-1">
                You can still add special classes or extra duties directly in the Daily Entry form.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {scheduledClassesToday.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                        {item.period}
                      </span>
                      {item.section && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {item.section}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 truncate">
                      {item.course}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.department} • {item.semester}
                    </p>
                  </div>

                  <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
                    Period {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                onNavigateToDate(currentDateStr);
                onNavigateTab('daily-entry');
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium py-2.5 px-4 rounded-xl text-sm border border-blue-200 dark:border-blue-800 transition"
            >
              <span>Go to Daily Entry Sheet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Recent Daily Records */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              Recent Activity Logs
            </h3>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
            >
              View Full Calendar
            </button>
          </div>

          <div className="space-y-2.5">
            {recentRecords.slice(0, 5).map((rec) => {
              const recDate = new Date(rec.date + 'T00:00:00');
              const recFormattedDate = recDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                weekday: 'short',
              });

              let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
              if (rec.attendanceStatus === 'Present') {
                badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
              } else if (rec.attendanceStatus === 'Holiday' || rec.isHoliday) {
                badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
              } else if (rec.attendanceStatus === 'On Leave' || rec.attendanceStatus === 'Absent') {
                badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
              }

              const classesTaken = rec.classes?.filter(c => c.taken).length ?? 0;
              const classesAllotted = rec.classes?.filter(c => c.allotted).length ?? 0;

              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    onNavigateToDate(rec.date);
                    onNavigateTab('daily-entry');
                  }}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 cursor-pointer transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {recFormattedDate}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {rec.attendanceStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {rec.classes?.length
                        ? `${classesTaken}/${classesAllotted} classes taken`
                        : rec.isHoliday
                        ? rec.holidayName || 'Holiday'
                        : 'No classes recorded'}
                      {rec.activities?.length ? ` • ${rec.activities.length} activities` : ''}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Android App Installation & QR Modal */}
      <AndroidAppModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </div>
  );
};
