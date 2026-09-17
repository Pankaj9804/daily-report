import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Check,
  X,
  AlertTriangle,
  Palmtree,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DailyRecord,
  ClassEntry,
  Activity,
  AttendanceStatus,
  HolidayType,
  NotTakenReason,
  ActivityType,
  AcademicSettings,
  TimetableEntry
} from '../types';

interface DailyEntryViewProps {
  selectedDateStr: string;
  onDateChange: (newDateStr: string) => void;
  record: DailyRecord | null;
  academicSettings: AcademicSettings;
  scheduledClassesForDay: TimetableEntry[];
  onSaveRecord: (record: DailyRecord) => void;
  onDeleteRecord: (dateStr: string) => void;
}

const NOT_TAKEN_REASONS: NotTakenReason[] = [
  'Holiday',
  'Examination',
  'Invigilation Duty',
  'Meeting',
  'College Event',
  'Personal Leave',
  'Teacher unavailable',
  'Student-related reason',
  'Other',
];

const HOLIDAY_TYPES: HolidayType[] = [
  'Sunday',
  'Government Holiday',
  'College Holiday',
  'Puja Vacation',
  'Summer Vacation',
  'Winter Vacation',
  'Special Holiday',
  'Other',
];

const ACTIVITY_TYPES: ActivityType[] = [
  'Invigilation Duty',
  'Examination Duty',
  'Paper Setting',
  'Paper Evaluation',
  'Meeting',
  'Departmental Work',
  'Scholarship Work',
  'Admission Work',
  'IQAC/NAAC Work',
  'Committee Work',
  'Workshop',
  'Seminar',
  'Training',
  'College Event',
  'Student Mentoring',
  'Administrative Work',
  'Other',
];

export const DailyEntryView: React.FC<DailyEntryViewProps> = ({
  selectedDateStr,
  onDateChange,
  record,
  academicSettings,
  scheduledClassesForDay,
  onSaveRecord,
  onDeleteRecord,
}) => {
  // Local form states initialized from record or defaults
  const [attendance, setAttendance] = useState<AttendanceStatus>('Present');
  const [reportingTime, setReportingTime] = useState<string>('09:45 AM');
  const [isHoliday, setIsHoliday] = useState<boolean>(false);
  const [holidayType, setHolidayType] = useState<HolidayType>('College Holiday');
  const [holidayName, setHolidayName] = useState<string>('');
  const [holidayRemarks, setHolidayRemarks] = useState<string>('');
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [generalRemarks, setGeneralRemarks] = useState<string>('');

  // Toast / Confirmation states
  const [showToast, setShowToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state whenever selectedDateStr or existing record changes
  useEffect(() => {
    const dateObj = new Date(selectedDateStr + 'T00:00:00');
    const isSunday = dateObj.getDay() === 0;

    if (record) {
      setAttendance(record.attendanceStatus || (isSunday ? 'Holiday' : 'Present'));
      setReportingTime(record.reportingTime || (isSunday ? '' : '09:45 AM'));
      setIsHoliday(record.isHoliday ?? (isSunday || record.attendanceStatus === 'Holiday'));
      setHolidayType(record.holidayType || (isSunday ? 'Sunday' : 'College Holiday'));
      setHolidayName(record.holidayName || (isSunday ? 'Sunday Weekly Holiday' : ''));
      setHolidayRemarks(record.holidayRemarks || '');
      setClasses(record.classes ? JSON.parse(JSON.stringify(record.classes)) : []);
      setActivities(record.activities ? JSON.parse(JSON.stringify(record.activities)) : []);
      setGeneralRemarks(record.generalRemarks || '');
    } else {
      // New / Unrecorded date defaults
      if (isSunday) {
        setAttendance('Holiday');
        setIsHoliday(true);
        setHolidayType('Sunday');
        setHolidayName('Sunday Weekly Holiday');
        setReportingTime('');
        setClasses([]);
        setActivities([]);
        setGeneralRemarks('Sunday weekly holiday.');
      } else {
        setAttendance('Present');
        setIsHoliday(false);
        setHolidayType('College Holiday');
        setHolidayName('');
        setReportingTime('09:45 AM');
        setActivities([]);
        setGeneralRemarks('');

        // Automatically populate classes from weekly timetable for immediate speed!
        if (scheduledClassesForDay.length > 0) {
          const autoClasses: ClassEntry[] = scheduledClassesForDay.map((tt, idx) => ({
            id: `cls-auto-${Date.now()}-${idx}`,
            department: tt.department,
            semester: tt.semester,
            course: tt.course,
            section: tt.section || '',
            period: tt.period,
            allotted: true,
            taken: true,
            topic: '',
            notTakenReason: '',
            remarks: '',
          }));
          setClasses(autoClasses);
        } else {
          setClasses([]);
        }
      }
    }
  }, [selectedDateStr, record, scheduledClassesForDay]);

  // Quick Date Navigation: Previous Day, Next Day
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDateStr + 'T00:00:00');
    current.setDate(current.getDate() + days);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${d}`);
  };

  const handleSetToday = () => {
    // Current application sample base is Sep 17, 2026 or real today
    const now = new Date();
    // Default to the 2026-09-17 academic timeline unless changed
    onDateChange('2026-09-17');
  };

  // Timetable Generator button (User prompt #17 & #18)
  const handleLoadTimetableClasses = () => {
    if (scheduledClassesForDay.length === 0) {
      alert('No recurring classes are scheduled in your Timetable for this day of the week.');
      return;
    }
    const generated: ClassEntry[] = scheduledClassesForDay.map((tt, idx) => ({
      id: `cls-${Date.now()}-${idx}`,
      department: tt.department,
      semester: tt.semester,
      course: tt.course,
      section: tt.section || '',
      period: tt.period,
      allotted: true,
      taken: true,
      topic: '',
      notTakenReason: '',
      remarks: '',
    }));
    setClasses(generated);
  };

  // Add class
  const handleAddClass = () => {
    const defaultDept = academicSettings.departments[0] || 'Physics';
    const defaultCourse = academicSettings.coursesByDepartment[defaultDept]?.[0] || 'Electromagnetic Theory';
    const defaultPeriod = academicSettings.periods[classes.length % academicSettings.periods.length] || 'Period 1';

    const newClass: ClassEntry = {
      id: `cls-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      department: defaultDept,
      semester: 'Semester IV',
      course: defaultCourse,
      section: 'Sec A',
      period: defaultPeriod,
      allotted: true,
      taken: true,
      topic: '',
      notTakenReason: '',
      remarks: '',
    };
    setClasses([...classes, newClass]);
  };

  // Update Class
  const handleUpdateClass = (id: string, field: keyof ClassEntry, value: any) => {
    setClasses(prev =>
      prev.map(cls => {
        if (cls.id !== id) return cls;
        const updated = { ...cls, [field]: value };
        // If switching department, reset course to first available course in that dept
        if (field === 'department') {
          const avail = academicSettings.coursesByDepartment[value];
          if (avail && avail.length > 0) {
            updated.course = avail[0];
          }
        }
        // If taken becomes true, clear notTakenReason
        if (field === 'taken' && value === true) {
          updated.notTakenReason = '';
        }
        return updated;
      })
    );
  };

  // Remove Class
  const handleRemoveClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  // Add Activity
  const handleAddActivity = () => {
    const newAct: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'Meeting',
      description: '',
      startTime: '02:00 PM',
      endTime: '03:30 PM',
      location: 'Department',
      remarks: '',
    };
    setActivities([...activities, newAct]);
  };

  // Update Activity
  const handleUpdateActivity = (id: string, field: keyof Activity, value: any) => {
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, [field]: value } : act))
    );
  };

  // Remove Activity
  const handleRemoveActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // Calculate Statistics dynamically
  const classesAllotted = classes.filter(c => c.allotted).length;
  const classesTaken = classes.filter(c => c.allotted && c.taken).length;
  const classesNotTaken = classes.filter(c => c.allotted && !c.taken).length;

  // Save logic
  const handleSave = (andNext: boolean = false) => {
    const dailyData: DailyRecord = {
      id: record?.id || `rec-${selectedDateStr}`,
      date: selectedDateStr,
      attendanceStatus: attendance,
      reportingTime: attendance === 'Present' ? reportingTime : '',
      isHoliday: isHoliday || attendance === 'Holiday',
      holidayType: isHoliday || attendance === 'Holiday' ? holidayType : undefined,
      holidayName: isHoliday || attendance === 'Holiday' ? holidayName : undefined,
      holidayRemarks: isHoliday || attendance === 'Holiday' ? holidayRemarks : undefined,
      classes,
      activities,
      generalRemarks,
      updatedAt: new Date().toISOString(),
    };

    onSaveRecord(dailyData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    if (andNext) {
      handleShiftDate(1);
    }
  };

  // Clear Form logic
  const handleClearForm = () => {
    if (confirm('Are you sure you want to clear this day\'s form fields?')) {
      setClasses([]);
      setActivities([]);
      setGeneralRemarks('');
      setReportingTime('');
    }
  };

  // Delete Record logic
  const handleDeleteConfirm = () => {
    onDeleteRecord(selectedDateStr);
    setShowDeleteConfirm(false);
    // Reload defaults
    setClasses([]);
    setActivities([]);
    setGeneralRemarks('');
  };

  // Format header date display
  const dateObj = new Date(selectedDateStr + 'T00:00:00');
  const formattedDateTitle = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>Daily activity saved successfully.</span>
        </div>
      )}

      {/* Date Header & Quick Navigation */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Daily Academic Activity Entry
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formattedDateTitle}
          </h2>
        </div>

        {/* Date Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden">
            <button
              id="btn-day-prev"
              onClick={() => handleShiftDate(-1)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              id="input-daily-date"
              type="date"
              value={selectedDateStr}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="bg-transparent text-xs font-semibold px-2 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            <button
              id="btn-day-next"
              onClick={() => handleShiftDate(1)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-day-today"
            onClick={handleSetToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* SECTION 5: Attendance Status & Optional Reporting Time */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          Attendance Status
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['Present', 'Absent', 'On Leave', 'Holiday'] as AttendanceStatus[]).map((status) => {
            const isSelected = attendance === status;
            let activeClass = 'bg-blue-600 text-white border-blue-600 shadow-sm';
            if (status === 'Present' && isSelected) activeClass = 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
            if (status === 'Holiday' && isSelected) activeClass = 'bg-amber-600 text-white border-amber-600 shadow-sm';
            if ((status === 'Absent' || status === 'On Leave') && isSelected) activeClass = 'bg-rose-600 text-white border-rose-600 shadow-sm';

            return (
              <button
                key={status}
                type="button"
                id={`btn-attendance-${status.toLowerCase().replace(' ', '-')}`}
                onClick={() => {
                  setAttendance(status);
                  if (status === 'Holiday') {
                    setIsHoliday(true);
                  } else {
                    setIsHoliday(false);
                  }
                }}
                className={`py-3 px-4 rounded-xl font-semibold text-sm border transition text-center flex items-center justify-center gap-2 ${
                  isSelected
                    ? activeClass
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Optional Reporting Time if Present */}
        {attendance === 'Present' && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5 max-w-sm">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Reporting / Attendance Time (Optional):
            </label>
            <input
              type="text"
              id="input-reporting-time"
              value={reportingTime}
              onChange={(e) => setReportingTime(e.target.value)}
              placeholder="e.g. 09:45 AM"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* SECTION 7: Holiday Details (if Holiday is selected or toggled) */}
      {(attendance === 'Holiday' || isHoliday) && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 p-6 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Palmtree className="w-5 h-5 text-amber-600" />
              Holiday Information
            </h3>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Calendar will display this date as a holiday
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Holiday Type
              </label>
              <select
                id="select-holiday-type"
                value={holidayType}
                onChange={(e) => setHolidayType(e.target.value as HolidayType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
              >
                {HOLIDAY_TYPES.map(ht => (
                  <option key={ht} value={ht}>{ht}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Holiday Name
              </label>
              <input
                type="text"
                id="input-holiday-name"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                placeholder="e.g. Sunday, Puja Vacation, Special College Holiday"
                className="w-full px-3 py-2 text-sm rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Holiday Remarks (Optional)
            </label>
            <input
              type="text"
              id="input-holiday-remarks"
              value={holidayRemarks}
              onChange={(e) => setHolidayRemarks(e.target.value)}
              placeholder="e.g. Declared by Higher Education Department / College Council"
              className="w-full px-3 py-2 text-sm rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      )}

      {/* SECTION 5 & 6: Classes Section & Automatic Statistics */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Classes Allotted & Taken
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record all classes for this date with teaching topic and status
            </p>
          </div>

          {/* Quick 1-Click Load Timetable Button */}
          <button
            type="button"
            id="btn-generate-today-classes"
            onClick={handleLoadTimetableClasses}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition self-start sm:self-auto"
            title="Load scheduled classes from normal weekly timetable"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Today's Classes</span>
          </button>
        </div>

        {/* SECTION 6: Class Statistics Bar */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Classes Allotted</span>
            <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{classesAllotted}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Classes Taken</span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{classesTaken}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Classes Not Taken</span>
            <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{classesNotTaken}</p>
          </div>
        </div>

        {/* Classes List */}
        {classes.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No classes recorded yet for this date.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click <strong>"Generate Today's Classes"</strong> to load your weekly schedule or <strong>"Add Another Class"</strong> below.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((cls, idx) => (
              <div
                key={cls.id}
                className={`p-4 rounded-xl border transition ${
                  cls.taken
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900'
                    : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Class #{idx + 1}
                    </span>
                  </div>

                  {/* Fast Taken / Not Taken Toggle Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleUpdateClass(cls.id, 'taken', true)}
                        className={`flex items-center gap-1 px-3 py-1.5 transition ${
                          cls.taken
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Taken</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateClass(cls.id, 'taken', false)}
                        className={`flex items-center gap-1 px-3 py-1.5 transition ${
                          !cls.taken
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Not Taken</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveClass(cls.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete this class entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form fields for Class */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  {/* Department */}
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Department
                    </label>
                    <select
                      value={cls.department}
                      onChange={(e) => handleUpdateClass(cls.id, 'department', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                    >
                      {academicSettings.departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Semester
                    </label>
                    <select
                      value={cls.semester}
                      onChange={(e) => handleUpdateClass(cls.id, 'semester', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                    >
                      {academicSettings.semesters.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>

                  {/* Period */}
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Period / Time
                    </label>
                    <select
                      value={cls.period}
                      onChange={(e) => handleUpdateClass(cls.id, 'period', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                    >
                      {academicSettings.periods.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Section / Batch (Opt.)
                    </label>
                    <input
                      type="text"
                      value={cls.section || ''}
                      onChange={(e) => handleUpdateClass(cls.id, 'section', e.target.value)}
                      placeholder="e.g. Sec A, Lab 1"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </div>
                </div>

                {/* Course with autocomplete suggestion */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Course / Paper
                    </label>
                    <input
                      type="text"
                      list={`courses-${cls.id}`}
                      value={cls.course}
                      onChange={(e) => handleUpdateClass(cls.id, 'course', e.target.value)}
                      placeholder="e.g. Electromagnetic Theory"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                    />
                    <datalist id={`courses-${cls.id}`}>
                      {(academicSettings.coursesByDepartment[cls.department] || []).map(courseName => (
                        <option key={courseName} value={courseName} />
                      ))}
                    </datalist>
                  </div>

                  {/* Topic Taught */}
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Topic Taught {cls.taken && <span className="text-emerald-600">*</span>}
                    </label>
                    <input
                      type="text"
                      value={cls.topic || ''}
                      onChange={(e) => handleUpdateClass(cls.id, 'topic', e.target.value)}
                      placeholder="e.g. Maxwell's Equations, Boundary conditions"
                      disabled={!cls.taken}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-slate-800 dark:text-slate-200 font-medium ${
                        cls.taken
                          ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 opacity-60'
                      }`}
                    />
                  </div>
                </div>

                {/* If Not Taken: Ask for Reason (Section 6 Requirement) */}
                {!cls.taken && (
                  <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs">
                    <label className="block font-semibold text-rose-800 dark:text-rose-300 mb-1">
                      Reason Class Not Taken:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={NOT_TAKEN_REASONS.includes(cls.notTakenReason as any) ? cls.notTakenReason : 'Other'}
                        onChange={(e) => handleUpdateClass(cls.id, 'notTakenReason', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        <option value="">-- Select Reason --</option>
                        {NOT_TAKEN_REASONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={cls.notTakenReason || ''}
                        onChange={(e) => handleUpdateClass(cls.id, 'notTakenReason', e.target.value)}
                        placeholder="Custom explanation (e.g. Attending National Science Seminar)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          id="btn-add-another-class"
          onClick={handleAddClass}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-blue-400 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Class</span>
        </button>
      </div>

      {/* SECTION 8: Additional Activities (Invigilation, Examination, Meetings, etc.) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Other Academic / Administrative Activities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record invigilation, examination duties, meetings, evaluations, committee or NAAC work
            </p>
          </div>

          <button
            type="button"
            id="btn-add-activity"
            onClick={handleAddActivity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        </div>

        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No extra activities recorded for this date. (Optional)
          </p>
        ) : (
          <div className="space-y-3.5">
            {activities.map((act, idx) => (
              <div
                key={act.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Activity #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveActivity(act.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Remove activity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Activity Type
                    </label>
                    <select
                      value={act.type}
                      onChange={(e) => handleUpdateActivity(act.id, 'type', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                    >
                      {ACTIVITY_TYPES.map(at => (
                        <option key={at} value={at}>{at}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={act.description}
                      onChange={(e) => handleUpdateActivity(act.id, 'description', e.target.value)}
                      placeholder="e.g. B.Sc. Semester IV Examination duty in Room 204"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Start Time
                    </label>
                    <input
                      type="text"
                      value={act.startTime || ''}
                      onChange={(e) => handleUpdateActivity(act.id, 'startTime', e.target.value)}
                      placeholder="e.g. 11:00 AM"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      End Time
                    </label>
                    <input
                      type="text"
                      value={act.endTime || ''}
                      onChange={(e) => handleUpdateActivity(act.id, 'endTime', e.target.value)}
                      placeholder="e.g. 02:00 PM"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Location / Room
                    </label>
                    <input
                      type="text"
                      value={act.location || ''}
                      onChange={(e) => handleUpdateActivity(act.id, 'location', e.target.value)}
                      placeholder="e.g. Room 204, Auditorium"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 9: General Remarks */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          General Remarks
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Any notable departmental discussions, student concerns, or administrative notes
        </p>
        <textarea
          id="textarea-general-remarks"
          rows={3}
          value={generalRemarks}
          onChange={(e) => setGeneralRemarks(e.target.value)}
          placeholder="e.g. Attended departmental meeting regarding upcoming semester examination."
          className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
        />
      </div>

      {/* SECTION 10 & 11: Save, Save & Next, Clear, Delete Action Bar */}
      <div className="sticky bottom-4 md:bottom-6 z-30 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {record && (
            <button
              type="button"
              id="btn-delete-record"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition"
              title="Delete this entire day's record"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Day</span>
            </button>
          )}

          <button
            type="button"
            id="btn-clear-form"
            onClick={handleClearForm}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="btn-save-next-record"
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
          >
            <span>Save & Next Date</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="btn-save-record"
            onClick={() => handleSave(false)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Entry</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Daily Activity Record?
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete all recorded classes, activities, and attendance for{' '}
              <strong className="text-slate-900 dark:text-white">{formattedDateTitle}</strong>? This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
