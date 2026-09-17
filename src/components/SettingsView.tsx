import React, { useState } from 'react';
import {
  Settings,
  User,
  BookOpen,
  Database,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Smartphone
} from 'lucide-react';
import { ProfessorProfile, AcademicSettings } from '../types';
import { AndroidAppModal } from './AndroidAppModal';

interface SettingsViewProps {
  profile: ProfessorProfile;
  academicSettings: AcademicSettings;
  onSaveProfile: (profile: ProfessorProfile) => void;
  onSaveSettings: (settings: AcademicSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => boolean;
  onResetSampleData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  academicSettings,
  onSaveProfile,
  onSaveSettings,
  onExportBackup,
  onImportBackup,
  onResetSampleData,
}) => {
  // Local profile form state
  const [name, setName] = useState(profile.name);
  const [designation, setDesignation] = useState(profile.designation);
  const [department, setDepartment] = useState(profile.department);
  const [college, setCollege] = useState(profile.college);
  const [employeeId, setEmployeeId] = useState(profile.employeeId || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');

  // Local master settings
  const [departments, setDepartments] = useState<string[]>(academicSettings.departments);
  const [newDeptInput, setNewDeptInput] = useState('');
  const [periods, setPeriods] = useState<string[]>(academicSettings.periods);
  const [newPeriodInput, setNewPeriodInput] = useState('');

  // Selected Department for Course editing
  const [selectedDeptForCourses, setSelectedDeptForCourses] = useState<string>(
    academicSettings.departments[0] || 'Physics'
  );
  const [coursesByDept, setCoursesByDept] = useState<Record<string, string[]>>(
    academicSettings.coursesByDepartment
  );
  const [newCourseInput, setNewCourseInput] = useState('');

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      id: profile.id,
      name,
      designation,
      department,
      college,
      employeeId,
      email,
      phone,
    });
    triggerToast('Professor profile updated successfully.');
  };

  const handleAddDept = () => {
    if (!newDeptInput.trim()) return;
    if (departments.includes(newDeptInput.trim())) return;
    const updated = [...departments, newDeptInput.trim()];
    setDepartments(updated);
    setNewDeptInput('');
    onSaveSettings({
      ...academicSettings,
      departments: updated,
    });
  };

  const handleRemoveDept = (dept: string) => {
    if (departments.length <= 1) return;
    const updated = departments.filter(d => d !== dept);
    setDepartments(updated);
    if (selectedDeptForCourses === dept) {
      setSelectedDeptForCourses(updated[0]);
    }
    onSaveSettings({
      ...academicSettings,
      departments: updated,
    });
  };

  const handleAddCourse = () => {
    if (!newCourseInput.trim()) return;
    const currentList = coursesByDept[selectedDeptForCourses] || [];
    if (currentList.includes(newCourseInput.trim())) return;
    const updatedList = [...currentList, newCourseInput.trim()];
    const updatedAll = {
      ...coursesByDept,
      [selectedDeptForCourses]: updatedList,
    };
    setCoursesByDept(updatedAll);
    setNewCourseInput('');
    onSaveSettings({
      ...academicSettings,
      coursesByDepartment: updatedAll,
    });
  };

  const handleRemoveCourse = (courseName: string) => {
    const currentList = coursesByDept[selectedDeptForCourses] || [];
    const updatedList = currentList.filter(c => c !== courseName);
    const updatedAll = {
      ...coursesByDept,
      [selectedDeptForCourses]: updatedList,
    };
    setCoursesByDept(updatedAll);
    onSaveSettings({
      ...academicSettings,
      coursesByDepartment: updatedAll,
    });
  };

  // Import JSON Backup handler
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportBackup(content);
      if (success) {
        triggerToast('Data successfully restored from backup.');
      } else {
        alert('Invalid backup file format. Please check and try again.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Settings className="w-4 h-4" />
          <span>App Configuration</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
          Profile & Master Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your academic identity, department courses, teaching periods, and backup data.
        </p>
      </div>

      {/* SECTION 15: Professor Profile Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Professor Profile
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          These details are automatically populated in your monthly reports, PDF exports, and header badges.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name & Title
              </label>
              <input
                type="text"
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Pankaj Kumar Shaw"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Designation
              </label>
              <input
                type="text"
                id="profile-designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Assistant Professor / Associate Professor"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Department
              </label>
              <input
                type="text"
                id="profile-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Physics"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                College / Institution Name
              </label>
              <input
                type="text"
                id="profile-college"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Raja Peary Mohan College"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee ID / Code (Optional)
              </label>
              <input
                type="text"
                id="profile-employee-id"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. RPMC-PHY-042"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email (Optional)
              </label>
              <input
                type="email"
                id="profile-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. pankaj.physics@rpmcollege.edu.in"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              id="btn-save-profile"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 15: Master Data Setup (Departments & Courses) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Master Academic Setup
        </h3>

        {/* Departments management */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            College Departments
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {departments.map(dept => (
              <span
                key={dept}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <span>{dept}</span>
                {departments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDept(dept)}
                    className="p-0.5 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          <div className="mt-2.5 flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={newDeptInput}
              onChange={(e) => setNewDeptInput(e.target.value)}
              placeholder="New department name"
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
            />
            <button
              type="button"
              onClick={handleAddDept}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        {/* Course / Paper mapping by department */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Courses & Papers for:
            </label>
            <select
              value={selectedDeptForCourses}
              onChange={(e) => setSelectedDeptForCourses(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(coursesByDept[selectedDeptForCourses] || []).map(course => (
              <span
                key={course}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800"
              >
                <span>{course}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCourse(course)}
                  className="p-0.5 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="mt-2.5 flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={newCourseInput}
              onChange={(e) => setNewCourseInput(e.target.value)}
              placeholder={`Add course to ${selectedDeptForCourses}`}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 flex-1"
            />
            <button
              type="button"
              onClick={handleAddCourse}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Add Course
            </button>
          </div>
        </div>
      </div>

      {/* Android & Mobile Application Center */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 p-6 rounded-2xl border border-emerald-800/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Device Integration</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Android Application & Offline Setup
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Install this academic diary as an official Android app (WebAPK) on your phone or tablet. Works completely offline in college labs and lecture halls without Wi-Fi.
            </p>
          </div>

          <button
            id="btn-settings-open-android"
            onClick={() => setShowAndroidModal(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open Android App Center</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300">
            <span className="font-bold text-white block mb-1">⚡ Fast 1-Tap WebAPK</span>
            Open in Android Chrome and tap "Install app" to generate a real Android package on your device.
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300">
            <span className="font-bold text-white block mb-1">📷 Instant QR Scan</span>
            Scan with your Android camera or Google Lens to immediately transfer the diary to your smartphone.
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300">
            <span className="font-bold text-white block mb-1">📦 Standalone APK / AAB</span>
            Generate signed .apk or Play Store packages in 2 minutes via PWABuilder with 100% manifest score.
          </div>
        </div>
      </div>

      {/* SECTION 16: Backup, Restore & Data Management */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          Data Backup & Local Persistence
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          All your academic records and timetables are securely stored locally on this device. You can download a complete JSON backup or transfer it to another laptop/phone.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Backup Button */}
          <button
            id="btn-backup-json"
            onClick={onExportBackup}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex flex-col items-center text-center gap-2"
          >
            <Download className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Export Backup</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Download full .json file</p>
            </div>
          </button>

          {/* Restore Button */}
          <label className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex flex-col items-center text-center gap-2 cursor-pointer">
            <Upload className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Restore Backup</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Import from .json file</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Reset to Sample Data */}
          <button
            id="btn-reset-sample"
            onClick={() => {
              if (confirm('Reset to Dr. Pankaj Kumar Shaw sample academic session data? This will overwrite local changes.')) {
                onResetSampleData();
                triggerToast('Reset to default academic sample dataset.');
              }
            }}
            className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition flex flex-col items-center text-center gap-2"
          >
            <RotateCcw className="w-6 h-6 text-rose-600" />
            <div>
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Reset Sample Data</p>
              <p className="text-[11px] text-rose-600/80 mt-0.5">Dr. Pankaj Shaw (Sep 2026)</p>
            </div>
          </button>
        </div>
      </div>

      {/* Android App Installation & APK Modal */}
      <AndroidAppModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </div>
  );
};
