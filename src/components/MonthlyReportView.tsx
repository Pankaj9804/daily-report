import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  Calendar,
  BookOpen,
  Briefcase,
  ChevronRight,
  Sparkles,
  Edit3
} from 'lucide-react';
import {
  DailyRecord,
  ProfessorProfile,
  MonthlySummaryStats,
  ActivityType,
  AttendanceStatus
} from '../types';
import { exportMonthlyReportToExcel } from '../services/exportService';
import { PrintableReportModal } from './PrintableReportModal';

interface MonthlyReportViewProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (year: number, month: number) => void;
  profile: ProfessorProfile;
  stats: MonthlySummaryStats;
  records: DailyRecord[];
  onNavigateToDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  profile,
  stats,
  records,
  onNavigateToDate,
}) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Search & Filter state (Prompt Section 14)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActivityType, setFilterActivityType] = useState<string>('ALL');
  const [filterAttendance, setFilterAttendance] = useState<string>('ALL');
  const [filterCourse, setFilterCourse] = useState<string>('ALL');

  // Collect distinct course names from records
  const courseOptions = Array.from(
    new Set(
      records.flatMap(r => (r.classes || []).map(c => c.course)).filter(Boolean)
    )
  );

  // Collect distinct activity types from records
  const activityTypeOptions = Array.from(
    new Set(
      records.flatMap(r => (r.activities || []).map(a => a.type)).filter(Boolean)
    )
  );

  // Filter records based on user search & filter criteria
  const filteredRecords = records.filter(rec => {
    // Attendance filter
    if (filterAttendance !== 'ALL' && rec.attendanceStatus !== filterAttendance) {
      return false;
    }

    // Activity type filter
    if (filterActivityType !== 'ALL') {
      const hasType = (rec.activities || []).some(a => a.type === filterActivityType);
      if (!hasType) return false;
    }

    // Course filter
    if (filterCourse !== 'ALL') {
      const hasCourse = (rec.classes || []).some(c => c.course === filterCourse);
      if (!hasCourse) return false;
    }

    // Free text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDate = rec.date.includes(q);
      const matchRemarks = (rec.generalRemarks || '').toLowerCase().includes(q);
      const matchClasses = (rec.classes || []).some(
        c =>
          c.course.toLowerCase().includes(q) ||
          (c.topic || '').toLowerCase().includes(q) ||
          (c.notTakenReason || '').toLowerCase().includes(q)
      );
      const matchActivities = (rec.activities || []).some(
        a =>
          a.description.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          (a.location || '').toLowerCase().includes(q)
      );

      if (!matchDate && !matchRemarks && !matchClasses && !matchActivities) {
        return false;
      }
    }

    return true;
  });

  const handleExportExcel = () => {
    exportMonthlyReportToExcel(selectedYear, selectedMonth, profile, stats, records);
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-4 h-4" />
            <span>Academic Reporting & Submissions</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Monthly Academic Activity Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Faculty: <strong className="text-slate-700 dark:text-slate-200">{profile.name}</strong> • {profile.department}, {profile.college}
          </p>
        </div>

        {/* Month Selector & Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold">
            <select
              id="select-report-month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(selectedYear, Number(e.target.value))}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>{name}</option>
              ))}
            </select>
            <select
              id="select-report-year"
              value={selectedYear}
              onChange={(e) => onMonthChange(Number(e.target.value), selectedMonth)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              {[2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            title="Download formatted Excel spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            id="btn-export-pdf"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            title="Print or export formal PDF report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* SECTION 12: Monthly Summary Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Monthly Summary — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
          <span className="text-xs font-normal text-slate-500">
            {records.length} days logged
          </span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Parameter</th>
                <th className="p-3 text-right">Count</th>
                <th className="p-3">Parameter</th>
                <th className="p-3 text-right">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              <tr>
                <td className="p-3">Total Days</td>
                <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{stats.totalDays}</td>
                <td className="p-3">Classes Allotted</td>
                <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{stats.classesAllotted}</td>
              </tr>
              <tr>
                <td className="p-3">Working Days</td>
                <td className="p-3 text-right font-bold">{stats.workingDays}</td>
                <td className="p-3">Classes Taken</td>
                <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{stats.classesTaken}</td>
              </tr>
              <tr>
                <td className="p-3">Present Days</td>
                <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{stats.presentDays}</td>
                <td className="p-3">Classes Not Taken</td>
                <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400">{stats.classesNotTaken}</td>
              </tr>
              <tr>
                <td className="p-3">Leave Days</td>
                <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400">{stats.leaveDays}</td>
                <td className="p-3">Extra Activities</td>
                <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{stats.extraActivities}</td>
              </tr>
              <tr>
                <td className="p-3">Holidays</td>
                <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400">{stats.holidays}</td>
                <td className="p-3">Invigilation Duties</td>
                <td className="p-3 text-right font-bold text-purple-600 dark:text-purple-400">{stats.invigilationDuties}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 14: Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Search & Filter Records
          </h4>
          {(searchQuery || filterActivityType !== 'ALL' || filterAttendance !== 'ALL' || filterCourse !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterActivityType('ALL');
                setFilterAttendance('ALL');
                setFilterCourse('ALL');
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              id="input-filter-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic, activity, remarks..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>

          {/* Activity Type Filter */}
          <select
            id="select-filter-activity"
            value={filterActivityType}
            onChange={(e) => setFilterActivityType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Activity Types</option>
            <option value="Invigilation Duty">Invigilation Duty</option>
            <option value="Examination Duty">Examination Duty</option>
            <option value="Meeting">Meeting</option>
            <option value="Departmental Work">Departmental Work</option>
            <option value="Seminar">Seminar / Workshop</option>
            <option value="Paper Setting">Paper Setting</option>
            <option value="Student Mentoring">Student Mentoring</option>
            {activityTypeOptions.map(at => (
              <option key={at} value={at}>{at}</option>
            ))}
          </select>

          {/* Attendance Filter */}
          <select
            id="select-filter-attendance"
            value={filterAttendance}
            onChange={(e) => setFilterAttendance(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Attendance</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
            <option value="Holiday">Holiday</option>
          </select>

          {/* Course Filter */}
          <select
            id="select-filter-course"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Courses</option>
            {courseOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Detailed Activity Table (Section 12 of User Prompt) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Daily Records ({filteredRecords.length} entries matched)
          </h3>
          <span className="text-xs text-slate-400">Click a row to edit that day</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No records matched your selected criteria for this month.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 w-24">Date</th>
                  <th className="p-3 w-24">Attendance</th>
                  <th className="p-3 w-24 text-center">Allotted</th>
                  <th className="p-3 w-24 text-center">Taken</th>
                  <th className="p-3">Classes Taught / Not Taken</th>
                  <th className="p-3">Other Activities</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map((rec) => {
                  const dateObj = new Date(rec.date + 'T00:00:00');
                  const formattedDay = dateObj.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    weekday: 'short',
                  });

                  const allotted = rec.classes?.filter(c => c.allotted).length ?? 0;
                  const taken = rec.classes?.filter(c => c.taken).length ?? 0;

                  let attBadge = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                  if (rec.attendanceStatus === 'Present') attBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
                  if (rec.attendanceStatus === 'Holiday' || rec.isHoliday) attBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
                  if (rec.attendanceStatus === 'Absent' || rec.attendanceStatus === 'On Leave') attBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition cursor-pointer"
                      onClick={() => onNavigateToDate(rec.date)}
                    >
                      <td className="p-3 font-bold whitespace-nowrap text-slate-900 dark:text-white">
                        {formattedDay}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${attBadge}`}>
                          {rec.attendanceStatus}
                        </span>
                      </td>

                      <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400">
                        {allotted || '-'}
                      </td>

                      <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {taken || '-'}
                      </td>

                      <td className="p-3 max-w-xs">
                        {rec.classes && rec.classes.length > 0 ? (
                          <div className="space-y-1">
                            {rec.classes.map((c, i) => (
                              <div key={i} className="text-[11px] leading-tight">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {c.course}:
                                </span>{' '}
                                {c.taken ? (
                                  <span className="text-emerald-700 dark:text-emerald-400">
                                    {c.topic || 'Class Taken'}
                                  </span>
                                ) : (
                                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                                    Not Taken ({c.notTakenReason || 'No reason'})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="p-3 max-w-xs">
                        {rec.activities && rec.activities.length > 0 ? (
                          <div className="space-y-1">
                            {rec.activities.map((a, i) => (
                              <div key={i} className="text-[11px] leading-tight">
                                <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                                  [{a.type}]
                                </span>{' '}
                                <span className="text-slate-700 dark:text-slate-300">
                                  {a.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {rec.generalRemarks || '-'}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToDate(rec.date);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                          title="Edit this record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Report Modal */}
      {showPrintModal && (
        <PrintableReportModal
          year={selectedYear}
          month={selectedMonth}
          profile={profile}
          stats={stats}
          records={records}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
