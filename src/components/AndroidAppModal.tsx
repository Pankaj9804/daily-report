import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  X,
  QrCode,
  Chrome,
  Share2,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'features'>('install');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 220,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Academic Diary for Android
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 text-[10px] font-semibold border border-emerald-300/30">
                  Android Ready
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Install as a standalone Android app with full offline capabilities & homescreen launcher
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'install'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Chrome className="w-3.5 h-3.5" />
            <span>Install on Android</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate APK / AAB</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>App Features</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* TAB 1: 1-TAP INSTALL & QR CODE */}
          {activeTab === 'install' && (
            <div className="space-y-6">
              {/* Direct 1-tap prompt if available */}
              {isInstallable && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Browser Ready to Install
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Chrome detected Android PWA support. Tap below to install immediately.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await install();
                      onClose();
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition whitespace-nowrap active:scale-95"
                  >
                    Install to Android Now
                  </button>
                </div>
              )}

              {isInstalled && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>The application is already installed on this device in standalone mode.</span>
                </div>
              )}

              {/* QR Code & Mobile URL Sharing */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="md:col-span-4 flex flex-col items-center text-center">
                  <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Android App QR Code"
                        className="w-36 h-36 rounded-lg block"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-emerald-600" />
                    Scan with Android Camera
                  </span>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Open on Your Android Phone
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Point your Android smartphone camera or Google Lens at the QR code, or copy the link below and send it to your phone via WhatsApp or email:
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Android Installation Guide */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Quick 3-Step Installation on Android
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Open in Chrome
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Open the copied link in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on Android.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Tap Menu (⋮)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Tap the <strong>three dots (⋮)</strong> menu in the upper-right corner of the browser.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Select "Install app"
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Android creates an official WebAPK!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Native WebAPK Technology:</strong> Google Chrome on Android compiles this app into an official Android package. It appears in your Android App Drawer, supports home screen shortcuts (long-press icon for Daily Entry), and runs full-screen without any browser address bar.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE APK & PLAY STORE PACKAGE */}
          {activeTab === 'apk' && (
            <div className="space-y-5 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Packaging into a Standalone Android APK or AAB
                  </h4>
                </div>
                <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  Because this application has a verified Web App Manifest, Service Worker, and high-resolution icons (192px and 512px maskable), you can package it into a signed Android <code>.apk</code> or Google Play Store <code>.aab</code> package in just a couple minutes.
                </p>
              </div>

              {/* Option A: PWABuilder */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    Method 1: PWABuilder (Recommended — No Code)
                  </h4>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-500"
                  >
                    <span>pwabuilder.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1 text-[11px] leading-relaxed">
                  <li>Visit <strong className="text-slate-800 dark:text-slate-200">pwabuilder.com</strong> in your browser.</li>
                  <li>Enter your app URL: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600">{currentUrl}</code></li>
                  <li>Click <strong className="text-slate-800 dark:text-slate-200">"Start"</strong> — the tool tests manifest, icons, and service worker (all 100% passing).</li>
                  <li>Click <strong className="text-slate-800 dark:text-slate-200">"Package for Android"</strong> to download a signed <code>.apk</code> or Google Play Store <code>.aab</code> bundle!</li>
                </ol>
              </div>

              {/* Option B: Bubblewrap CLI */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">2</span>
                    Method 2: Google Chrome Bubblewrap (TWA)
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">CLI Developer Flow</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  For engineers who prefer generating an Android Studio project via Google's official Trusted Web Activity (TWA) CLI:
                </p>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 text-[10px] font-mono overflow-x-auto leading-normal">
{`# 1. Install Google Bubblewrap
npm install -g @bubblewrap/cli

# 2. Initialize Android project from this live manifest
bubblewrap init --manifest="${currentUrl}manifest.webmanifest"

# 3. Build signed APK/AAB
bubblewrap build`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID FEATURES & OFFLINE CAPABILITIES */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    100% Offline Capability
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Classrooms and laboratories often lack Wi-Fi. All daily entries, timetable routines, and remarks are stored locally on your Android device with zero data loss.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Edge-to-Edge Fullscreen
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    No browser URL bar or navigation clutter. Adapts to modern Android gesture navigation and camera cutouts with <code>viewport-fit=cover</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Home Screen Shortcuts
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Long-press the Android home screen app icon to jump straight into "New Daily Entry", "Timetable", or "Monthly Reports".
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    One-Tap Backup & Reports
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Generate printable PDF reports and download full JSON backups to your Android Downloads folder or Google Drive anytime.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Works on Android 8.0 through Android 15+
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
