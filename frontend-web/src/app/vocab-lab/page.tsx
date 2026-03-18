'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { DecksTab } from './components/DecksTab';
import { AddCardTab } from './components/AddCardTab';
import { BrowseTab } from './components/BrowseTab';
import { StatsTab } from './components/StatsTab';

type Tab = 'decks' | 'add' | 'browse' | 'stats';

export default function VocabLabPage() {
  const [activeTab, setActiveTab] = useState<Tab>('decks');

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20">
      <PageHeader
        title="VOCAB LAB"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Vocab Lab' },
        ]}
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1773518563/4b145836-e585-4092-852e-2cbd64aec326.png"
      />

      <div className={`mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 ${activeTab === 'browse' ? 'max-w-[95%]' : 'max-w-6xl'}`}>
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-2 flex space-x-2 shadow-sm border border-gray-100">
            {[
              { id: 'decks', label: 'Decks' },
              { id: 'add', label: 'Add' },
              { id: 'browse', label: 'Browse' },
              { id: 'stats', label: 'Stats' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-primary text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
