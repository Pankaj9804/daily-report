import {
  ProfessorProfile,
  AcademicSettings,
  TimetableEntry,
  DailyRecord,
  MonthlySummaryStats
} from '../types';
import {
  defaultProfessorProfile,
  defaultAcademicSettings,
  defaultTimetable,
  sampleDailyRecords
} from '../data/sampleData';

const STORAGE_KEYS = {
  PROFILE: 'academic_diary_profile_v1',
  SETTINGS: 'academic_diary_settings_v1',
  TIMETABLE: 'academic_diary_timetable_v1',
  RECORDS: 'academic_diary_records_v1',
  INITIALIZED: 'academic_diary_initialized_v1',
};

// Event to notify components across the app of data changes
export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('academic_data_updated'));
  }
}

// Initialize seed data if not previously initialized
function initializeStorageIfEmpty() {
  if (typeof window === 'undefined') return;
  try {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfessorProfile));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultAcademicSettings));
      localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(defaultTimetable));
      
      const recordMap: Record<string, DailyRecord> = {};
      sampleDailyRecords.forEach((r) => {
        recordMap[r.date] = r;
      });
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(recordMap));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  } catch (err) {
    console.error('Failed to initialize storage:', err);
  }
}

// Run initialization immediately on load
initializeStorageIfEmpty();

// --- Professor Profile ---
export function getProfessorProfile(): ProfessorProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading professor profile:', err);
  }
  return defaultProfessorProfile;
}

export function saveProfessorProfile(profile: ProfessorProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    notifyDataChanged();
  } catch (err) {
    console.error('Error saving profile:', err);
  }
}

// --- Academic Settings ---
export function getAcademicSettings(): AcademicSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading academic settings:', err);
  }
  return defaultAcademicSettings;
}

export function saveAcademicSettings(settings: AcademicSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    notifyDataChanged();
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

// --- Timetable ---
export function getTimetable(): TimetableEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading timetable:', err);
  }
  return defaultTimetable;
}

export function saveTimetable(timetable: TimetableEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
    notifyDataChanged();
  } catch (err) {
    console.error('Error saving timetable:', err);
  }
}

export function getTimetableForDay(dayOfWeek: number): TimetableEntry[] {
  const all = getTimetable();
  return all.filter((entry) => entry.dayOfWeek === dayOfWeek);
}

// --- Daily Records ---
export function getAllDailyRecordsMap(): Record<string, DailyRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading daily records:', err);
  }
  return {};
}

export function getAllDailyRecords(): DailyRecord[] {
  const map = getAllDailyRecordsMap();
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

export function getDailyRecord(dateStr: string): DailyRecord | null {
  const map = getAllDailyRecordsMap();
  return map[dateStr] || null;
}

export function saveDailyRecord(record: DailyRecord): void {
  try {
    const map = getAllDailyRecordsMap();
    record.updatedAt = new Date().toISOString();
    map[record.date] = record;
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(map));
    notifyDataChanged();
  } catch (err) {
    console.error('Error saving daily record:', err);
  }
}

export function deleteDailyRecord(dateStr: string): boolean {
  try {
    const map = getAllDailyRecordsMap();
    if (map[dateStr]) {
      delete map[dateStr];
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(map));
      notifyDataChanged();
      return true;
    }
  } catch (err) {
    console.error('Error deleting daily record:', err);
  }
  return false;
}

// --- Monthly Records & Stats ---
export function getRecordsForMonth(year: number, month: number): DailyRecord[] {
  // month is 1-indexed (1 to 12)
  const map = getAllDailyRecordsMap();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return Object.values(map)
    .filter((r) => r.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateMonthlyStats(
  year: number,
  month: number,
  recordsMap?: Record<string, DailyRecord>
): MonthlySummaryStats {
  const map = recordsMap || getAllDailyRecordsMap();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const records = Object.values(map)
    .filter((r) => r.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date));
  const daysInMonth = new Date(year, month, 0).getDate();

  let presentDays = 0;
  let leaveDays = 0;
  let absentDays = 0;
  let holidays = 0;
  let classesAllotted = 0;
  let classesTaken = 0;
  let classesNotTaken = 0;
  let extraActivities = 0;
  let invigilationDuties = 0;

  records.forEach((rec) => {
    if (rec.attendanceStatus === 'Present') {
      presentDays++;
    } else if (rec.attendanceStatus === 'On Leave') {
      leaveDays++;
    } else if (rec.attendanceStatus === 'Absent') {
      absentDays++;
    } else if (rec.attendanceStatus === 'Holiday' || rec.isHoliday) {
      holidays++;
    }

    // Classes stats
    if (rec.classes && rec.classes.length > 0) {
      rec.classes.forEach((cls) => {
        if (cls.allotted) classesAllotted++;
        if (cls.taken) {
          classesTaken++;
        } else if (cls.allotted) {
          classesNotTaken++;
        }
      });
    }

    // Activities stats
    if (rec.activities && rec.activities.length > 0) {
      extraActivities += rec.activities.length;
      rec.activities.forEach((act) => {
        if (
          act.type === 'Invigilation Duty' ||
          act.type === 'Examination Duty' ||
          act.description.toLowerCase().includes('invigilation')
        ) {
          invigilationDuties++;
        }
      });
    }
  });

  // Working days = Total recorded days that are not holidays (or total non-holiday days in month)
  // According to college standards: days in month minus holidays
  const workingDays = Math.max(0, daysInMonth - holidays);

  return {
    totalDays: daysInMonth,
    workingDays,
    presentDays,
    leaveDays,
    absentDays,
    holidays,
    classesAllotted,
    classesTaken,
    classesNotTaken,
    extraActivities,
    invigilationDuties,
  };
}

// --- Backup & Restore ---
export function exportBackupJSON(): string {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profile: getProfessorProfile(),
    settings: getAcademicSettings(),
    timetable: getTimetable(),
    records: getAllDailyRecordsMap(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid backup file format.' };
    }
    if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.timetable) localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(data.timetable));
    if (data.records) localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data.records));

    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    notifyDataChanged();
    return { success: true, message: 'Data imported and restored successfully!' };
  } catch (err: any) {
    return { success: false, message: `Import error: ${err?.message || 'Failed to parse backup'}` };
  }
}

export function resetToSampleData(): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfessorProfile));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultAcademicSettings));
  localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(defaultTimetable));
  
  const recordMap: Record<string, DailyRecord> = {};
  sampleDailyRecords.forEach((r) => {
    recordMap[r.date] = r;
  });
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(recordMap));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  notifyDataChanged();
}

export const getDailyRecords = getAllDailyRecordsMap;
export const exportFullBackupJSON = exportBackupJSON;
export const importFullBackupJSON = (jsonStr: string): boolean => {
  const res = importBackupJSON(jsonStr);
  return res.success;
};
