'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AddCardTab } from '@/app/vocab-lab/components/AddCardTab';
import { usePathname } from 'next/navigation';

export function GlobalVocabFab() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-vocab-fab', handleOpen);
    return () => window.removeEventListener('open-vocab-fab', handleOpen);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    const target = e.currentTarget.parentElement!;
    const rect = target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const isTakePage = pathname.includes("/take/") ||
                     pathname.includes("/practice/") ||
                     pathname.endsWith("/start") ||
                     pathname === "/ielts/basic/onboarding" ||
                     pathname.includes("/admin") ||
                     pathname.includes("/vocab-lab");

  if (!user || isTakePage) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 z-[8999] flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-95 transition-all duration-200 focus:outline-none"
        title="Add to Vocab Lab"
      >
        {isOpen ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            {/* Bookmark shape */}
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            {/* Plus sign inside */}
            <line x1="12" y1="8" x2="12" y2="14" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
        )}
      </button>

      {/* Non-blocking Floating Widget */}
      {isOpen && (
        <div
          style={{
            resize: 'both',
            left: pos.x !== null ? `${pos.x}px` : undefined,
            top: pos.y !== null ? `${pos.y}px` : undefined,
            bottom: pos.y !== null ? 'auto' : undefined,
            transition: isDragging ? 'none' : undefined
          }}
          className={`fixed bottom-[10vh] left-28 z-[9000] w-[600px] min-w-[300px] max-w-[90vw] max-h-[85vh] bg-gray-100 dark:bg-gray-900 backdrop-blur-3xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-gray-200/60 dark:border-gray-700 ${pos.x === null ? 'animate-fade-in-up' : ''}`}
        >
          {/* Modal Header */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex items-center justify-between px-5 md:px-4 pt-5 pb-2 bg-transparent z-10 sticky top-0 shrink-0 cursor-move select-none touch-none"
          >
            <h2 className="text-[13px] font-bold text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-2 uppercase">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                <line x1="12" y1="8" x2="12" y2="14" />
                <line x1="9" y1="11" x2="15" y2="11" />
              </svg>
              Quick Add Card
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-md transition-colors focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body reusing AddCardTab exactly as requested */}
          <div className="flex-1 overflow-y-auto p-2 sm:px-4 sm:pb-4 sm:pt-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            <AddCardTab isActive={true} />
          </div>
        </div>
      )}
    </>
  );
}
