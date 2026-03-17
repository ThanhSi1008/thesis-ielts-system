'use client';

import { useState, useEffect } from 'react';
import { vocabLabApi } from '@/services/vocabLab.api';
import type { VocabLabStats } from '@/types';

export function StatsTab() {
  const [stats, setStats] = useState<VocabLabStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await vocabLabApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate percentages
  const total = stats.totalCount || 1; // Prevent division by zero
  const newPct = (stats.newCount / total) * 100;
  const learnPct = (stats.learningCount / total) * 100;
  const reviewPct = (stats.reviewCount / total) * 100;

  // Pie chart segments for conic-gradient
  const newEnd = newPct;
  const learnEnd = newEnd + learnPct;
  // reviewEnd is 100%
  const conicGradient = `conic-gradient(
    #3B82F6 0% ${newEnd}%, 
    #EF4444 ${newEnd}% ${learnEnd}%, 
    #10B981 ${learnEnd}% 100%
  )`;

  return (
    <div className="min-h-[800px] pb-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-12">Card Counts</h2>
        
        {stats.totalCount === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>You don't have any flashcards yet.</p>
            <p className="text-sm mt-2">Go to the Add tab to create some cards!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-md">
            {/* Pie Chart */}
            <div 
              className="w-64 h-64 rounded-full mb-12 shadow-inner"
              style={{ background: conicGradient }}
              title="Card Stats Distribution"
            ></div>

            {/* Legend */}
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-blue-500 mr-4"></div>
                  <span className="text-gray-700 font-medium">New</span>
                </div>
                <div className="flex space-x-8">
                  <span className="text-gray-900 font-semibold w-8 text-right">{stats.newCount}</span>
                  <span className="text-gray-500 w-16 text-right">{newPct.toFixed(2)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-red-500 mr-4"></div>
                  <span className="text-gray-700 font-medium">Learning</span>
                </div>
                <div className="flex space-x-8">
                  <span className="text-gray-900 font-semibold w-8 text-right">{stats.learningCount}</span>
                  <span className="text-gray-500 w-16 text-right">{learnPct.toFixed(2)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-green-500 mr-4"></div>
                  <span className="text-gray-700 font-medium">Reviewing</span>
                </div>
                <div className="flex space-x-8">
                  <span className="text-gray-900 font-semibold w-8 text-right">{stats.reviewCount}</span>
                  <span className="text-gray-500 w-16 text-right">{reviewPct.toFixed(2)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-gray-300 rounded mr-4"></div>
                  <span className="text-gray-700 font-bold">Total</span>
                </div>
                <div className="flex space-x-8">
                  <span className="text-gray-900 font-bold w-8 text-right">{stats.totalCount}</span>
                  <span className="w-16"></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
