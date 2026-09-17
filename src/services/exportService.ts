import * as XLSX from 'xlsx';
import { DailyRecord, ProfessorProfile, MonthlySummaryStats } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function exportMonthlyReportToExcel(
  year: number,
  month: number,
  profile: ProfessorProfile,
  stats: MonthlySummaryStats,
  records: DailyRecord[]
) {
  const monthName = MONTH_NAMES[month - 1];
  const workbook = XLSX.utils.book_new();

  // --- SHEET 1: Summary ---
  const summaryData = [
    ['DAILY ACADEMIC ACTIVITY REPORT - MONTHLY SUMMARY'],
    [''],
    ['Institution / College:', profile.college],
    ['Department:', profile.department],
    ['Faculty Name:', profile.name],
    ['Designation:', profile.designation],
    ['Employee ID:', profile.employeeId || 'N/A'],
    ['Email:', profile.email || 'N/A'],
    ['Month & Year:', `${monthName} ${year}`],
    ['Generated On:', new Date().toLocaleString()],
    [''],
    ['MONTHLY METRIC SUMMARY', 'COUNT / VALUE'],
    ['Total Days in Month', stats.totalDays],
    ['Working Days', stats.workingDays],
    ['Present Days', stats.presentDays],
    ['Leave Days', stats.leaveDays],
    ['Absent Days', stats.absentDays],
    ['Holidays', stats.holidays],
    ['Classes Allotted', stats.classesAllotted],
    ['Classes Actually Taken', stats.classesTaken],
    ['Classes Not Taken', stats.classesNotTaken],
    ['Extra / Administrative Activities', stats.extraActivities],
    ['Invigilation / Exam Duties', stats.invigilationDuties],
    [''],
    ['Class Engagement Percentage', stats.classesAllotted > 0 ? `${((stats.classesTaken / stats.classesAllotted) * 100).toFixed(1)}%` : 'N/A'],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 35 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Monthly Summary');

  // --- SHEET 2: Detailed Daily Records ---
  const daysInMonth = new Date(year, month, 0).getDate();
  const detailRows: (string | number)[][] = [
    [
      'Date',
      'Day',
      'Attendance',
      'Reporting Time',
      'Classes Allotted',
      'Classes Taken',
      'Classes Missed',
      'Classes Detail (Course, Sem, Topic / Reason)',
      'Other Academic / Administrative Activities',
      'General Remarks'
    ]
  ];

  // Map existing records by date
  const recordMap = new Map<string, DailyRecord>();
  records.forEach(r => recordMap.set(r.date, r));

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    const dayName = DAY_NAMES[dateObj.getDay()];
    const rec = recordMap.get(dateStr);

    if (!rec) {
      // Unrecorded date
      const isSunday = dateObj.getDay() === 0;
      detailRows.push([
        dateStr,
        dayName,
        isSunday ? 'Sunday (Holiday)' : 'No Entry',
        '-',
        0,
        0,
        0,
        '-',
        '-',
        '-'
      ]);
      continue;
    }

    // Classes summary
    let allottedCount = 0;
    let takenCount = 0;
    let notTakenCount = 0;
    const classDetailsText: string[] = [];

    (rec.classes || []).forEach((c, idx) => {
      if (c.allotted) allottedCount++;
      if (c.taken) takenCount++;
      else if (c.allotted) notTakenCount++;

      const statusTag = c.taken ? '[TAKEN]' : `[NOT TAKEN: ${c.notTakenReason || 'Unspecified'}]`;
      const topicStr = c.topic ? ` Topic: ${c.topic}` : '';
      const remStr = c.remarks ? ` (${c.remarks})` : '';
      classDetailsText.push(
        `#${idx + 1} ${c.period} - ${c.course} (${c.semester}): ${statusTag}${topicStr}${remStr}`
      );
    });

    // Activities summary
    const activityText: string[] = [];
    (rec.activities || []).forEach((a) => {
      const timeStr = a.startTime && a.endTime ? ` [${a.startTime} - ${a.endTime}]` : '';
      const locStr = a.location ? ` at ${a.location}` : '';
      activityText.push(`• [${a.type}] ${a.description}${timeStr}${locStr}`);
    });

    let attText: string = rec.attendanceStatus;
    if (rec.isHoliday && rec.holidayName) {
      attText += ` (${rec.holidayName})`;
    }

    detailRows.push([
      rec.date,
      dayName,
      attText,
      rec.reportingTime || '-',
      allottedCount,
      takenCount,
      notTakenCount,
      classDetailsText.join(' | ') || '-',
      activityText.join(' | ') || '-',
      rec.generalRemarks || '-'
    ]);
  }

  const detailSheet = XLSX.utils.aoa_to_sheet(detailRows);
  detailSheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 11 }, // Day
    { wch: 16 }, // Attendance
    { wch: 15 }, // Reporting Time
    { wch: 14 }, // Allotted
    { wch: 14 }, // Taken
    { wch: 14 }, // Missed
    { wch: 50 }, // Classes Detail
    { wch: 45 }, // Activities
    { wch: 35 }, // Remarks
  ];
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Daily Activity Log');

  // Trigger Excel File Download
  const fileName = `Daily_Academic_Activity_Report_${monthName}_${year}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
