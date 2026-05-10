'use client';

import React, { useEffect, useState } from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  message: React.ReactNode;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>, duration?: number) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, update: Partial<Omit<Toast, 'id'>>) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (newToast, duration) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...newToast, id }] }));
    // loading toasts persist until manually dismissed/updated
    if (duration !== 0 && newToast.type !== 'loading') {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration ?? 3000);
    }
    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  updateToast: (id, update) =>
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, ...update } : t
      ),
    })),
}));

// Provide a convenient global proxy
export const toast = {
  success: (message: React.ReactNode, duration?: number) =>
    useToastStore.getState().addToast({ message, type: 'success' }, duration),
  error: (message: React.ReactNode, duration = 4000) =>
    useToastStore.getState().addToast({ message, type: 'error' }, duration),
  info: (message: React.ReactNode, duration?: number) =>
    useToastStore.getState().addToast({ message, type: 'info' }, duration),
  loading: (message: React.ReactNode) =>
    useToastStore.getState().addToast({ message, type: 'loading' }, 0),
  dismiss: (id: string) =>
    useToastStore.getState().removeToast(id),
  update: (id: string, type: ToastType, message: React.ReactNode, duration?: number) => {
    useToastStore.getState().updateToast(id, { type, message });
    // auto-dismiss after update
    setTimeout(() => {
      useToastStore.getState().removeToast(id);
    }, duration ?? (type === 'error' ? 4000 : 3000));
  },
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[99999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] border min-w-[300px] ${
              t.type === 'error'
                ? 'bg-[#1a1a1a] border-red-900/50 text-red-400'
                : t.type === 'success'
                ? 'bg-[#1a1a1a] border-green-900/50 text-white'
                : 'bg-[#1a1a1a] border-gray-800 text-white'
            }`}
          >
            {t.type === 'success' && (
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-500/10 text-green-400 rounded-full">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {t.type === 'error' && (
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-full">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {t.type === 'loading' && (
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <svg className="w-5 h-5 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
            )}
            {t.type === 'info' && (
               <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-full">
                 <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                 </svg>
              </div>
            )}
            <div className="text-[14px] font-medium flex-1 pt-[1px]">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
