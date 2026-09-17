import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import { TimetableEntry, AcademicSettings } from '../types';

interface TimetableManagerProps {
  timetable: TimetableEntry[];
  academicSettings: AcademicSettings;
  onSaveTimetable: (timetable: TimetableEntry[]) => void;
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
];

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  timetable,
  academicSettings,
  onSaveTimetable,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form states
  const [period, setPeriod] = useState<string>(academicSettings.periods[0] || 'Period 1');
  const [department, setDepartment] = useState<string>(academicSettings.departments[0] || 'Physics');
  const [semester, setSemester] = useState<string>('Semester IV');
  const [course, setCourse] = useState<string>('');
  const [section, setSection] = useState<string>('Sec A');

  const filteredEntries = timetable
    .filter(e => e.dayOfWeek === selectedDay)
    .sort((a, b) => a.period.localeCompare(b.period));

  const handleOpenAdd = () => {
    setEditingEntryId(null);
    setPeriod(academicSettings.periods[0] || 'Period 1');
    const dept = academicSettings.departments[0] || 'Physics';
    setDepartment(dept);
    setSemester('Semester IV');
    setCourse(academicSettings.coursesByDepartment[dept]?.[0] || '');
    setSection('Sec A');
    setShowAddModal(true);
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    setEditingEntryId(entry.id);
    setPeriod(entry.period);
    setDepartment(entry.department);
    setSemester(entry.semester);
    setCourse(entry.course);
    setSection(entry.section || '');
    setShowAddModal(true);
  };

  const handleSaveEntry = () => {
    if (!course.trim()) {
      alert('Please enter or select a Course / Paper.');
      return;
    }

    if (editingEntryId) {
      const updated = timetable.map(item =>
        item.id === editingEntryId
          ? {
              ...item,
              dayOfWeek: selectedDay,
              period,
              department,
              semester,
              course,
              section,
            }
          : item
      );
      onSaveTimetable(updated);
    } else {
      const newEntry: TimetableEntry = {
        id: `tt-${Date.now()}`,
        dayOfWeek: selectedDay,
        period,
        department,
        semester,
        course,
        section,
      };
      onSaveTimetable([...timetable, newEntry]);
    }
    setShowAddModal(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Delete this timetable class slot?')) {
      onSaveTimetable(timetable.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Clock className="w-4 h-4" />
            <span>Recurring Class Schedule</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Weekly Timetable
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure your regular teaching schedule. In Daily Entry, click <strong>"Generate Today's Classes"</strong> to auto-fill these slots in 1 click!
          </p>
        </div>

        <button
          id="btn-add-timetable-slot"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class Slot</span>
        </button>
      </div>

      {/* Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DAYS_OF_WEEK.map(d => {
          const count = timetable.filter(t => t.dayOfWeek === d.id).length;
          const isSelected = selectedDay === d.id;
          return (
            <button
              key={d.id}
              id={`tab-day-${d.name.toLowerCase()}`}
              onClick={() => setSelectedDay(d.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{d.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Table / Cards for Selected Day */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name} Classes ({filteredEntries.length} Scheduled)
          </h3>

          <span className="text-xs text-slate-400">
            Sorted chronologically by period
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No classes scheduled on {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add your allotted lectures, practical labs, or tutorials to this day's timetable.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Class</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEntries.map((entry, idx) => (
              <div
                key={entry.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/50">
                        {entry.period}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {entry.department} • {entry.semester}
                      </span>
                      {entry.section && (
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                          {entry.section}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 truncate">
                      {entry.course}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEdit(entry)}
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit slot"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                {editingEntryId ? 'Edit Timetable Slot' : 'Add Timetable Slot'} — {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Period / Time Slot
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                >
                  {academicSettings.periods.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => {
                    const newDept = e.target.value;
                    setDepartment(newDept);
                    const firstCourse = academicSettings.coursesByDepartment[newDept]?.[0] || '';
                    setCourse(firstCourse);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                >
                  {academicSettings.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                >
                  {academicSettings.semesters.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Section / Batch (Optional)
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. Sec A, Lab 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course / Paper Name
              </label>
              <input
                type="text"
                list="modal-course-list"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Electromagnetic Theory"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              />
              <datalist id="modal-course-list">
                {(academicSettings.coursesByDepartment[department] || []).map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEntry}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm"
              >
                Save Timetable Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
