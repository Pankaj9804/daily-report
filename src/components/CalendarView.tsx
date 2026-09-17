import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  BookOpen,
  Briefcase,
  Palmtree,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DailyRecord } from '../types';

interface CalendarViewProps {
  currentDateStr: string;
  selectedMonth: number; // 1-12
  selectedYear: number;
  onMonthChange: (year: number, month: number) => void;
  dailyRecordsMap: Record<string, DailyRecord>;
  onSelectDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDateStr,
  selectedMonth,
  selectedYear,
  onMonthChange,
  dailyRecordsMap,
  onSelectDate,
}) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onMonthChange(selectedYear - 1, 12);
    } else {
      onMonthChange(selectedYear, selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onMonthChange(selectedYear + 1, 1);
    } else {
      onMonthChange(selectedYear, selectedMonth + 1);
    }
  };

  const handleTodayMonth = () => {
    const today = new Date(currentDateStr + 'T00:00:00');
    onMonthChange(today.getFullYear(), today.getMonth() + 1);
  };

  // Calendar matrix computation
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay(); // 0 = Sun

  const calendarCells = [];
  // Leading empty cells
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      dateStr,
      record: dailyRecordsMap[dateStr] || null,
      isToday: dateStr === currentDateStr,
      isSunday: (firstDayOfWeek + day - 1) % 7 === 0,
    });
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <CalendarIcon className="w-4 h-4" />
            <span>Academic Schedule & Records</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </h2>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-cal-today"
            onClick={handleTodayMonth}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
            <button
              id="btn-cal-prev"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-cal-next"
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Status Legend (as requested in Prompt #4) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400">Status Legend:</span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-950" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Present / Classes Taken</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200 dark:ring-blue-950" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Extra Activity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-950" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-950" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Absent / On Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">No Entry</span>
          </div>
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center py-2.5">
          {WEEKDAY_NAMES.map((name, i) => (
            <div
              key={name}
              className={`text-xs font-bold tracking-wider uppercase ${
                i === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[90px] sm:min-h-[110px] bg-slate-50/40 dark:bg-slate-950/20"
                />
              );
            }

            const { day, dateStr, record, isToday, isSunday } = cell;

            // Determine primary indicator status
            let statusDotColor = 'bg-slate-200 dark:bg-slate-700';
            let statusLabel = 'No Entry';
            const hasClassesTaken = record?.classes?.some(c => c.taken);
            const hasExtraActivity = (record?.activities?.length ?? 0) > 0;
            const isHoliday = record?.isHoliday || record?.attendanceStatus === 'Holiday' || (!record && isSunday);
            const isAbsentOrLeave = record?.attendanceStatus === 'Absent' || record?.attendanceStatus === 'On Leave';

            if (record) {
              if (isHoliday) {
                statusDotColor = 'bg-amber-500';
                statusLabel = record.holidayName || 'Holiday';
              } else if (isAbsentOrLeave) {
                statusDotColor = 'bg-rose-500';
                statusLabel = record.attendanceStatus;
              } else if (hasClassesTaken) {
                statusDotColor = 'bg-emerald-500';
                statusLabel = 'Present / Classes Taken';
              } else if (hasExtraActivity) {
                statusDotColor = 'bg-blue-500';
                statusLabel = 'Extra Activity';
              } else if (record.attendanceStatus === 'Present') {
                statusDotColor = 'bg-emerald-500';
                statusLabel = 'Present';
              }
            } else if (isSunday) {
              statusDotColor = 'bg-amber-400/80';
              statusLabel = 'Sunday';
            }

            const classesTakenCount = record?.classes?.filter(c => c.taken).length ?? 0;
            const classesAllottedCount = record?.classes?.filter(c => c.allotted).length ?? 0;

            return (
              <div
                key={dateStr}
                id={`calendar-cell-${dateStr}`}
                onClick={() => onSelectDate(dateStr)}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isToday
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500 ring-inset'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Top Row: Date Number & Dot Status */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center text-xs sm:text-sm font-bold w-6 h-6 rounded-full ${
                      isToday
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isSunday
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {day}
                  </span>

                  <span
                    className={`w-2.5 h-2.5 rounded-full ${statusDotColor}`}
                    title={statusLabel}
                  />
                </div>

                {/* Content Badges */}
                <div className="my-1 space-y-1">
                  {record ? (
                    <>
                      {record.isHoliday ? (
                        <div className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/50 rounded px-1.5 py-0.5 truncate">
                          {record.holidayName || 'Holiday'}
                        </div>
                      ) : (
                        <>
                          {classesAllottedCount > 0 && (
                            <div className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/50 rounded px-1.5 py-0.5 flex items-center justify-between">
                              <span className="truncate">Classes</span>
                              <span className="font-bold shrink-0">{classesTakenCount}/{classesAllottedCount}</span>
                            </div>
                          )}

                          {record.activities && record.activities.length > 0 && (
                            <div className="text-[10px] font-medium text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 rounded px-1.5 py-0.5 truncate flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="truncate">{record.activities[0].type}</span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : isSunday ? (
                    <div className="text-[10px] font-medium text-amber-600 dark:text-amber-400 opacity-80 px-1 truncate">
                      Sunday
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-300 dark:text-slate-600 group-hover:text-blue-600 transition flex items-center gap-0.5 px-1">
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </div>
                  )}
                </div>

                {/* Bottom marker bar */}
                <div className="flex gap-1 items-center">
                  {record?.classes?.some(c => c.taken) && (
                    <span className="h-1 flex-1 rounded bg-emerald-500" title="Classes Taken" />
                  )}
                  {record?.activities && record.activities.length > 0 && (
                    <span className="h-1 flex-1 rounded bg-blue-500" title="Extra Activities" />
                  )}
                  {isHoliday && (
                    <span className="h-1 flex-1 rounded bg-amber-500" title="Holiday" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
