export type AttendanceStatus = 'Present' | 'Absent' | 'On Leave' | 'Holiday';

export type HolidayType =
  | 'Sunday'
  | 'Government Holiday'
  | 'College Holiday'
  | 'Puja Vacation'
  | 'Summer Vacation'
  | 'Winter Vacation'
  | 'Special Holiday'
  | 'Other';

export type NotTakenReason =
  | 'Holiday'
  | 'Examination'
  | 'Invigilation Duty'
  | 'Meeting'
  | 'College Event'
  | 'Personal Leave'
  | 'Teacher unavailable'
  | 'Student-related reason'
  | 'Other';

export type ActivityType =
  | 'Invigilation Duty'
  | 'Examination Duty'
  | 'Paper Setting'
  | 'Paper Evaluation'
  | 'Meeting'
  | 'Departmental Work'
  | 'Scholarship Work'
  | 'Admission Work'
  | 'IQAC/NAAC Work'
  | 'Committee Work'
  | 'Workshop'
  | 'Seminar'
  | 'Training'
  | 'College Event'
  | 'Student Mentoring'
  | 'Administrative Work'
  | 'Other';

export interface ClassEntry {
  id: string;
  department: string;
  semester: string;
  course: string;
  section?: string;
  period: string;
  allotted: boolean;
  taken: boolean;
  topic?: string;
  notTakenReason?: NotTakenReason | string;
  remarks?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  remarks?: string;
}

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  attendanceStatus: AttendanceStatus;
  reportingTime?: string;
  isHoliday: boolean;
  holidayType?: HolidayType;
  holidayName?: string;
  holidayRemarks?: string;
  classes: ClassEntry[];
  activities: Activity[];
  generalRemarks: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ... 6 = Saturday, 0 = Sunday
  period: string;
  department: string;
  semester: string;
  course: string;
  section?: string;
  timeSlot?: string;
}

export interface ProfessorProfile {
  id: string;
  name: string;
  department: string;
  designation: string;
  college: string;
  employeeId?: string;
  email?: string;
  phone?: string;
}

export interface AcademicSettings {
  departments: string[];
  coursesByDepartment: Record<string, string[]>;
  semesters: string[];
  periods: string[];
}

export interface MonthlySummaryStats {
  totalDays: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
  holidays: number;
  classesAllotted: number;
  classesTaken: number;
  classesNotTaken: number;
  extraActivities: number;
  invigilationDuties: number;
}
