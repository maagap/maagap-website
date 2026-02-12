'use client';

import { useState, useEffect } from 'react';

interface AlertProps {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

export function ProfessionalAlert({ show, type, title, message, onClose }: AlertProps) {
  if (!show) return null;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    info: 'bg-blue-50 border-blue-500 text-blue-900',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-fadeIn">
        <div className={`p-6 border-l-4 ${colors[type]} rounded-lg`}>
          <div className="flex items-start">
            <div className="text-4xl mr-4">{icons[type]}</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-sm whitespace-pre-line">{message}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConfirmProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ProfessionalConfirm({ show, title, message, onConfirm, onCancel }: ConfirmProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-fadeIn">
        <div className="p-6 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg">
          <div className="flex items-start">
            <div className="text-4xl mr-4">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 text-yellow-900">{title}</h3>
              <p className="text-sm text-yellow-900 whitespace-pre-line">{message}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Global alert helper functions
let showAlertCallback: ((type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void) | null = null;
let showConfirmCallback: ((title: string, message: string, onConfirm: () => void) => void) | null = null;

export function setAlertCallback(callback: typeof showAlertCallback) {
  showAlertCallback = callback;
}

export function setConfirmCallback(callback: typeof showConfirmCallback) {
  showConfirmCallback = callback;
}

export function showAlert(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) {
  if (showAlertCallback) {
    showAlertCallback(type, title, message);
  } else {
    alert(`${title}\n\n${message}`);
  }
}

export function showConfirm(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (showConfirmCallback) {
      showConfirmCallback(title, message, () => resolve(true));
    } else {
      resolve(confirm(`${title}\n\n${message}`));
    }
  });
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string } | null>(null);
  const [confirm, setConfirm] = useState<{ show: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    setAlertCallback((type, title, message) => {
      setAlert({ show: true, type, title, message });
    });

    setConfirmCallback((title, message, onConfirm) => {
      setConfirm({ show: true, title, message, onConfirm });
    });
  }, []);

  return (
    <>
      {children}
      {alert && (
        <ProfessionalAlert
          show={alert.show}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      {confirm && (
        <ProfessionalConfirm
          show={confirm.show}
          title={confirm.title}
          message={confirm.message}
          onConfirm={() => {
            confirm.onConfirm();
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
