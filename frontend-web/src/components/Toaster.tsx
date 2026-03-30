'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (newToast, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...newToast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Provide a convenient global proxy
export const toast = {
  success: (message: string, duration?: number) => useToastStore.getState().addToast({ message, type: 'success' }, duration),
  error: (message: string, duration = 4000) => useToastStore.getState().addToast({ message, type: 'error' }, duration),
  info: (message: string, duration?: number) => useToastStore.getState().addToast({ message, type: 'info' }, duration),
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border animate-in slide-in-from-right-8 fade-in duration-300 min-w-[300px] ${
            t.type === 'error'
              ? 'bg-white border-red-200 text-gray-800'
              : t.type === 'success'
              ? 'bg-white border-green-200 text-gray-800'
              : 'bg-white border-blue-200 text-gray-800'
          }`}
        >
          {t.type === 'success' && (
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-full">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {t.type === 'error' && (
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-full">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {t.type === 'info' && (
             <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full">
               <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
               </svg>
            </div>
          )}
          <p className="text-[14px] font-medium flex-1 pt-[1px] text-gray-800">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
