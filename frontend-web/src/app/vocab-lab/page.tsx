'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { DecksTab } from './components/DecksTab';
import { AddCardTab } from './components/AddCardTab';
import { BrowseTab } from './components/BrowseTab';
import { StatsTab } from './components/StatsTab';

type Tab = 'decks' | 'add' | 'browse' | 'stats';

export default function VocabLabPage() {
  const [activeTab, setActiveTab] = useState<Tab>('decks');
  const [bannerCollapsed, setBannerCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('vocablab-banner-collapsed');
    return stored === null ? true : stored === 'true';
  });

  const toggleBanner = () => {
    setBannerCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('vocablab-banner-collapsed', String(next));
      return next;
    });
  };



  useEffect(() => {
    window.dispatchEvent(new CustomEvent('set-header-plain', { detail: bannerCollapsed }));
  }, [bannerCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Banner — collapsible */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out relative origin-top"
        style={{
          maxHeight: bannerCollapsed ? '0px' : '300px',
          opacity: bannerCollapsed ? 0 : 1
        }}
      >
        <PageHeader
          title="VOCAB LAB"
          breadcrumbs={[
            { label: 'Homepage', href: '/' },
            { label: 'Vocab Lab' },
          ]}
          backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1773518563/4b145836-e585-4092-852e-2cbd64aec326.png"
        />
      </div>

      {/* Sticky bar — only the collapse toggle */}
      <div className={`top-0 z-30 bg-transparent transition-all duration-300 ${bannerCollapsed ? '' : 'pt-2 pb-2'}`}>
        <div className="container mx-auto max-w-screen-xl px-4 flex justify-end">
          <button
            onClick={toggleBanner}
            title={bannerCollapsed ? 'Show banner' : 'Hide banner'}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-full transition-colors select-none"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${bannerCollapsed ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${activeTab === 'browse' ? 'max-w-[95%]' : 'max-w-6xl'}`}>

        {/* Tab pills */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-md border border-gray-100">
            {[
              { id: 'decks', label: 'Decks' },
              { id: 'add', label: 'Add' },
              { id: 'browse', label: 'Browse' },
              { id: 'stats', label: 'Stats' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-6 py-2 rounded-xl text-[14px] font-bold tracking-wide transition-all ${activeTab === tab.id
                  ? 'bg-primary text-gray-900 shadow-sm scale-100'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 scale-[0.98]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content — all tabs stay mounted to prevent scroll jumps */}
        <div className={activeTab === 'decks' ? '' : 'hidden'}><DecksTab isActive={activeTab === 'decks'} /></div>
        <div className={activeTab === 'add' ? '' : 'hidden'}><AddCardTab isActive={activeTab === 'add'} /></div>
        <div className={activeTab === 'browse' ? '' : 'hidden'}><BrowseTab isActive={activeTab === 'browse'} /></div>
        <div className={activeTab === 'stats' ? '' : 'hidden'}><StatsTab isActive={activeTab === 'stats'} /></div>
      </div>
    </div>
  );
}
