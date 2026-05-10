'use client';

import React, { useState, useEffect } from 'react';
import { SharedDeckCard } from './components/SharedDeckCard';
import { vocabLabApi } from '@/services/vocabLab.api';
import { SharedDeck } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Flame, Inbox } from 'lucide-react';

const COMMUNITY_CATEGORIES = [
  'English', 'IELTS', 'TOEFL', 'TOEIC', 'Academic',
  'Business', 'Medical', 'Legal', 'Science', 'Daily',
] as const;

type PageTab = 'explore' | 'my-published';

export default function CommunityPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<PageTab>('explore');
  const [decks, setDecks] = useState<SharedDeck[]>([]);
  const [featuredDecks, setFeaturedDecks] = useState<SharedDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'popular' | 'newest'>('popular');
  const [category, setCategory] = useState<string>('');

  const fetchDecks = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-published') {
        if (user) {
          const data = await vocabLabApi.browseSharedDecks({ publisherId: user.id, sort });
          setDecks(data);
        } else {
          setDecks([]);
        }
      } else {
        const data = await vocabLabApi.browseSharedDecks({ search, sort, category: category || undefined });
        setDecks(data);
      }
    } catch (error) {
      console.error('Failed to fetch shared decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedDecks = async () => {
    setLoadingFeatured(true);
    try {
      const data = await vocabLabApi.browseSharedDecks({ sort: 'popular', limit: 8 });
      setFeaturedDecks(data);
    } catch (error) {
      console.error('Failed to fetch featured decks:', error);
    } finally {
      setLoadingFeatured(false);
    }
  };

  useEffect(() => {
    fetchFeaturedDecks();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDecks();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, sort, category, activeTab, user]);

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Community Marketplace
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and import flashcard decks shared by other users.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('explore')}
          className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'explore'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
        >
          Explore
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('my-published')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'my-published'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
          >
            My Published Decks
          </button>
        )}
      </div>

      {activeTab === 'explore' && !search && !category && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Flame className="w-5 h-5 mr-2 text-orange-500" /> Featured Decks
          </h2>
          {loadingFeatured ? (
            <div className="py-10 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
              {featuredDecks.map((deck) => (
                <div key={deck.id} className="min-w-[300px] sm:min-w-[340px] snap-start">
                  <SharedDeckCard deck={deck} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'explore' && (
        <>
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === ''
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
            >
              All
            </button>
            {COMMUNITY_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat
                    ? 'bg-primary text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search decks by name, description, or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      ) : decks.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No decks found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'my-published'
              ? 'You have not published any decks yet.'
              : 'Try adjusting your search terms or be the first to publish a deck!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <SharedDeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
