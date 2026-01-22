'use client';

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-900 to-red-800 text-white p-6 rounded-lg shadow-2xl z-50 animate-fadeIn">
      <button
        onClick={() => setShowInstallPrompt(false)}
        className="absolute top-2 right-2 text-white hover:text-yellow-300"
      >
        ✕
      </button>
      <h3 className="font-bold text-lg mb-2">Install MAAGAP App</h3>
      <p className="text-sm mb-4">Install our app for quick access and offline features!</p>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-2 px-4 rounded transition-colors flex-1"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="bg-white/20 hover:bg-white/30 py-2 px-4 rounded transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
}
