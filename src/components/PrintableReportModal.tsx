import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { DailyRecord, ProfessorProfile, MonthlySummaryStats } from '../types';

interface PrintableReportModalProps {
  year: number;
  month: number;
  profile: ProfessorProfile;
  stats: MonthlySummaryStats;
  records: DailyRecord[];
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  year,
  month,
  profile,
  stats,
  records,
  onClose,
}) => {
  const monthName = MONTH_NAMES[month - 1];
  const daysInMonth = new Date(year, month, 0).getDate();

  const handlePrint = () => {
    window.print();
  };

  // Map daily records by date
  const recordMap = new Map<string, DailyRecord>();
  records.forEach(r => recordMap.set(r.date, r));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-2 sm:p-6 backdrop-blur-xs flex items-center justify-center print:p-0 print:bg-white print:fixed-none">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none print:text-black">
        {/* Top Action Bar (Hidden during printing) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">Printable Academic Report Preview</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-print-dialog"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 space-y-6 print:p-0 print:space-y-4">
          {/* Official College Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
              {profile.college}
            </h1>
            <p className="text-sm font-semibold text-slate-700 tracking-wide mt-0.5">
              DEPARTMENT OF {profile.department.toUpperCase()}
            </p>
            <div className="inline-block mt-3 px-4 py-1 rounded bg-slate-100 border border-slate-300">
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                DAILY ACADEMIC ACTIVITY REPORT
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              For the Month of <strong>{monthName} {year}</strong>
            </p>
          </div>

          {/* Professor Information Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 p-3 rounded bg-slate-50/50">
            <div>
              <span className="text-slate-500 font-medium">Faculty Name:</span>
              <p className="font-bold text-slate-900">{profile.name}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Designation:</span>
              <p className="font-bold text-slate-900">{profile.designation}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Department:</span>
              <p className="font-bold text-slate-900">{profile.department}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Employee ID:</span>
              <p className="font-bold text-slate-900">{profile.employeeId || 'N/A'}</p>
            </div>
          </div>

          {/* Section: Monthly Summary (Table 1) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-l-4 border-slate-800 pl-2">
              I. Monthly Activity Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-left">
                    <th className="border border-slate-300 p-2 font-bold">Parameter</th>
                    <th className="border border-slate-300 p-2 font-bold text-right">Count</th>
                    <th className="border border-slate-300 p-2 font-bold">Parameter</th>
                    <th className="border border-slate-300 p-2 font-bold text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-1.5">Total Days</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold">{stats.totalDays}</td>
                    <td className="border border-slate-300 p-1.5">Classes Allotted</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold text-blue-700">{stats.classesAllotted}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-1.5">Working Days</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold">{stats.workingDays}</td>
                    <td className="border border-slate-300 p-1.5">Classes Taken</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold text-emerald-700">{stats.classesTaken}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-1.5">Present Days</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold text-emerald-700">{stats.presentDays}</td>
                    <td className="border border-slate-300 p-1.5">Classes Not Taken</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold text-rose-700">{stats.classesNotTaken}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-1.5">Leave / Absent Days</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold text-amber-700">{stats.leaveDays + stats.absentDays}</td>
                    <td className="border border-slate-300 p-1.5">Extra / Admin Activities</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold">{stats.extraActivities}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-1.5">Holidays & Sundays</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold text-amber-600">{stats.holidays}</td>
                    <td className="border border-slate-300 p-1.5">Invigilation & Exam Duties</td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold text-purple-700">{stats.invigilationDuties}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Detailed Daily Records (Table 2) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 border-l-4 border-slate-800 pl-2">
              II. Detailed Daily Academic & Activity Record
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-left">
                    <th className="border border-slate-300 p-1.5 w-16 font-bold">Date</th>
                    <th className="border border-slate-300 p-1.5 w-24 font-bold">Attendance</th>
                    <th className="border border-slate-300 p-1.5 w-16 text-center font-bold">Allotted</th>
                    <th className="border border-slate-300 p-1.5 w-16 text-center font-bold">Taken</th>
                    <th className="border border-slate-300 p-1.5 font-bold">Classes Taught / Not Taken Reasons</th>
                    <th className="border border-slate-300 p-1.5 font-bold">Other Activities</th>
                    <th className="border border-slate-300 p-1.5 font-bold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: daysInMonth }, (_, idx) => {
                    const day = idx + 1;
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dateObj = new Date(year, month - 1, day);
                    const dayName = DAY_NAMES[dateObj.getDay()];
                    const rec = recordMap.get(dateStr);

                    if (!rec) {
                      const isSunday = dateObj.getDay() === 0;
                      return (
                        <tr key={dateStr} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-1 font-medium whitespace-nowrap">
                            {day} {monthName.slice(0, 3)} ({dayName})
                          </td>
                          <td className="border border-slate-300 p-1 text-slate-500">
                            {isSunday ? 'Sunday' : '-'}
                          </td>
                          <td className="border border-slate-300 p-1 text-center">-</td>
                          <td className="border border-slate-300 p-1 text-center">-</td>
                          <td className="border border-slate-300 p-1 text-slate-400 italic">-</td>
                          <td className="border border-slate-300 p-1 text-slate-400 italic">-</td>
                          <td className="border border-slate-300 p-1 text-slate-400 italic">-</td>
                        </tr>
                      );
                    }

                    const allotted = rec.classes?.filter(c => c.allotted).length ?? 0;
                    const taken = rec.classes?.filter(c => c.taken).length ?? 0;

                    return (
                      <tr key={dateStr} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-1 font-bold whitespace-nowrap">
                          {day} {monthName.slice(0, 3)} ({dayName})
                        </td>
                        <td className="border border-slate-300 p-1 font-semibold">
                          {rec.attendanceStatus}
                          {rec.isHoliday && rec.holidayName ? ` (${rec.holidayName})` : ''}
                        </td>
                        <td className="border border-slate-300 p-1 text-center font-bold">{allotted || '-'}</td>
                        <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700">{taken || '-'}</td>
                        <td className="border border-slate-300 p-1 leading-tight">
                          {rec.classes && rec.classes.length > 0 ? (
                            <ul className="list-disc list-inside space-y-0.5">
                              {rec.classes.map((c, i) => (
                                <li key={i}>
                                  <strong>{c.course}</strong> ({c.semester}):{' '}
                                  {c.taken ? (
                                    <span className="text-emerald-700">{c.topic || 'Class Taken'}</span>
                                  ) : (
                                    <span className="text-rose-600 font-medium">
                                      Not Taken ({c.notTakenReason || 'Reason not recorded'})
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="border border-slate-300 p-1 leading-tight">
                          {rec.activities && rec.activities.length > 0 ? (
                            <ul className="list-disc list-inside space-y-0.5">
                              {rec.activities.map((a, i) => (
                                <li key={i}>
                                  <strong>{a.type}:</strong> {a.description}{' '}
                                  {a.location ? `(${a.location})` : ''}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="border border-slate-300 p-1 text-slate-700 leading-tight">
                          {rec.generalRemarks || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Sign-off block as specified in Prompt #13 */}
          <div className="pt-10 flex items-center justify-between border-t border-slate-300 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-slate-700">Date: ________________________</p>
              <p className="text-[10px] text-slate-500">Verified by Academic Committee / HOD</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-semibold text-slate-700">Signature of Faculty: ________________________</p>
              <p className="font-bold text-slate-900">{profile.name}</p>
              <p className="text-[10px] text-slate-500">{profile.designation}, Dept. of {profile.department}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
