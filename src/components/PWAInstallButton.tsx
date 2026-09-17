import React, { useState } from 'react';
import { Download, Share, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AndroidAppModal } from './AndroidAppModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'sidebar'
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-[11px] text-emerald-300 font-medium">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installed as App</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowAndroidModal(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowAndroidModal(true);
    }
  };

  return (
    <>
      <button
        id="btn-install-android-pwa"
        onClick={handleClick}
        className={
          className ||
          (variant === 'sidebar'
            ? "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-950/50 transition active:scale-98"
            : variant === 'compact'
            ? "flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs transition"
            : "flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition")
        }
        title="Install Android App or Add to Home Screen"
      >
        <Smartphone className="w-4 h-4 shrink-0" />
        <span>Get Android App</span>
      </button>

      {/* Android App Modal with QR Code, WebAPK & APK Generation Guide */}
      <AndroidAppModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Share className="w-4 h-4 text-blue-600" />
                Install on iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              1. Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button in your Safari toolbar.<br />
              2. Scroll down and tap <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong>.<br />
              3. Tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top-right corner.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700 transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>Offline Mode — All changes saved locally on device.</span>
    </div>
  );
};
