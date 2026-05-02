'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { DecksTab } from './components/DecksTab';
import { AddCardTab } from './components/AddCardTab';
import { BrowseTab } from './components/BrowseTab';
import { StatsTab } from './components/StatsTab';
import { useIeltsSidebar } from '@/contexts/IeltsSidebarContext';

type Tab = 'decks' | 'add' | 'browse' | 'stats';

const NAV_ITEMS = [
  {
    id: 'decks',
    label: 'Decks',
    shortLabel: 'Decks',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 12 12 17 22 12"></polyline>
        <polyline points="2 17 12 22 22 17"></polyline>
      </svg>
    )
  },
  {
    id: 'add',
    label: 'Add',
    shortLabel: 'Add',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    )
  },
  {
    id: 'browse',
    label: 'Browse',
    shortLabel: 'Browse',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    )
  },
  {
    id: 'stats',
    label: 'Stats',
    shortLabel: 'Stats',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    )
  },
];

export default function VocabLabPage() {
  const [activeTab, setActiveTab] = useState<Tab>('decks');
  const { mode, isOverlayOpen, closeOverlay } = useIeltsSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isMini = mode === 'mini';
  const width = isMini ? 'w-[72px]' : 'w-[240px]';

  if (!mounted) return null;

  const renderNavItems = (isOverlay = false) => (
    <nav className={`flex flex-col ${isMini && !isOverlay ? 'gap-1 items-center w-full' : 'gap-1'}`}>
      {NAV_ITEMS.map((tab) => {
        const isActive = activeTab === tab.id;

        if (isMini && !isOverlay) {
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab);
                if (isOverlay) closeOverlay();
              }}
              title={tab.label}
              className={`group relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-colors ${isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-1 font-semibold leading-none truncate max-w-[56px]">
                {tab.shortLabel}
              </span>
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[70]">
                {tab.label}
              </div>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as Tab);
              if (isOverlay) closeOverlay();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] transition-colors text-left ${isActive
              ? "font-semibold bg-primary/10 text-primary"
              : "font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
          >
            {tab.icon}
            <span className="flex-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="h-[calc(100vh-56px)] bg-white dark:bg-slate-950 font-sans overflow-hidden flex">
      {/* Overlay Drawer */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 md:hidden ${isOverlayOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={closeOverlay}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white dark:bg-gray-900 z-[65] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isOverlayOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="h-[56px] shrink-0 flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={closeOverlay}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="ml-3" onClick={closeOverlay}>
            <img
              src="https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
              alt="Lexon Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
        <div className="overflow-y-auto p-3 flex-1">
          {renderNavItems(true)}
        </div>
      </aside>

      {/* Inline Sidebar */}
      {mode !== 'hidden' && (
        <aside
          className={`hidden md:flex flex-col ${width} shrink-0 bg-white dark:bg-gray-900 h-full sticky top-0 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out z-30`}
        >
          <div className={`flex flex-col h-full ${isMini ? 'items-center py-2' : 'p-3'}`}>
            {renderNavItems(false)}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-full flex flex-col transition-all duration-300 ease-in-out overflow-y-auto relative bg-white dark:bg-slate-950">

        <div className="pt-4" />

        {/* Tab Content */}
        <div className="mx-auto w-full">
          <div className={activeTab === 'decks' ? '' : 'hidden'}><DecksTab isActive={activeTab === 'decks'} /></div>
          <div className={activeTab === 'add' ? '' : 'hidden'}><AddCardTab isActive={activeTab === 'add'} /></div>
          <div className={activeTab === 'browse' ? '' : 'hidden'}><BrowseTab isActive={activeTab === 'browse'} /></div>
          <div className={activeTab === 'stats' ? '' : 'hidden'}><StatsTab isActive={activeTab === 'stats'} /></div>
        </div>
      </main>
    </div>
  );
}
