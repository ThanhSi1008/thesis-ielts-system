'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

import { SHADOWING_LESSONS, ShadowingLesson } from '@/data/shadowing-lessons';
import { shadowingApi, ShadowingProgress, ShadowingVideo } from '@/services/shadowing.api';
import { useAuth } from '@/contexts/AuthContext';

// ──── Data ────
const CATEGORIES = ['All', 'TOEIC', 'YouTube'];

// ──── Page Component ────
export default function ShadowingDictationPage() {
    const { isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [progress, setProgress] = useState<Record<string, { shadowing: number, dictation: number }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [bannerCollapsed, setBannerCollapsed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true;
        const stored = localStorage.getItem('shadowing-banner-collapsed');
        return stored === null ? true : stored === 'true';
    });

    const toggleBanner = () => {
        setBannerCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('shadowing-banner-collapsed', String(next));
            return next;
        });
    };

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            let combinedVideos: ShadowingLesson[] = [...SHADOWING_LESSONS];
            const newProgress: Record<string, { shadowing: number, dictation: number }> = {};

            if (isAuthenticated) {
                // Fetch progress
                const progressResponse = await shadowingApi.getAllProgress().catch(() => ({} as Record<string, { shadowing: number[]; dictation: number[] }>));

                // Calculate progress percentages based on API data
                combinedVideos.forEach(lesson => {
                    const total = lesson.sentences.length;
                    const lessonProgress = progressResponse[lesson.id];

                    let shadowingCount = 0;
                    let dictationCount = 0;

                    if (lessonProgress) {
                        if (lessonProgress.shadowing) shadowingCount = lessonProgress.shadowing.length;
                        if (lessonProgress.dictation) dictationCount = lessonProgress.dictation.length;
                    }

                    newProgress[lesson.id] = {
                        shadowing: total > 0 ? Math.round((shadowingCount / total) * 100) : 0,
                        dictation: total > 0 ? Math.round((dictationCount / total) * 100) : 0
                    };
                });
            } else {
                // Unauthenticated: just calculate progress for static lessons as 0%
                SHADOWING_LESSONS.forEach(lesson => {
                    newProgress[lesson.id] = { shadowing: 0, dictation: 0 };
                });
            }

            setProgress(newProgress);
        } catch (error) {
            console.error('Failed to load shadowing dictation data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('set-header-plain', { detail: bannerCollapsed }));
    }, [bannerCollapsed]);

    const filteredLessons = useMemo(() => {
        const allLessons = [...SHADOWING_LESSONS];
        return allLessons.filter((lesson) => {
            const matchesCategory = activeCategory === 'All' || lesson.tags.some(tag => tag.toUpperCase() === activeCategory.toUpperCase());
            const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

    return (
        <div className="relative min-h-screen bg-white pb-20">
            {/* Sticky Top Section: Search & Categories */}
            <div className="sticky top-0 z-50 bg-white pt-4 pb-2 px-4 sm:px-8 border-b border-gray-100">
                <div className="container mx-auto max-w-screen-xl">
                    {/* Search Bar + Mic */}
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <div className="flex w-full max-w-[600px] h-10">
                            {/* Input Field */}
                            <input
                                id="search-lessons"
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 h-full border border-gray-300 rounded-l-full px-5 text-[15px] focus:outline-none focus:border-blue-600 focus:shadow-inner bg-white"
                            />
                            {/* Search Button */}
                            <button className="h-full px-5 bg-[#f8f8f8] border border-l-0 border-gray-300 rounded-r-full hover:bg-[#f0f0f0] transition-colors flex items-center justify-center group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px] text-gray-700 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Decorative Mic Button */}
                        <button className="w-10 h-10 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] transition-colors flex items-center justify-center flex-shrink-0" title="Search with your voice">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#0f0f0f]">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                            </svg>
                        </button>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`h-8 px-3 rounded-lg font-medium text-[14px] flex items-center justify-center transition-colors whitespace-nowrap ${activeCategory === category
                                    ? 'bg-[#0f0f0f] text-white'
                                    : 'bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Banner — collapsible */}
            <div
                className="overflow-hidden transition-all duration-500 ease-in-out relative origin-top"
                style={{
                    maxHeight: bannerCollapsed ? '0px' : '300px',
                    opacity: bannerCollapsed ? 0 : 1
                }}
            >
                <PageHeader
                    title="Shadowing & Dictation"
                    backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772877124/28d5a6da-70f6-4b0b-acc9-78cbd397dbf9.png"
                    breadcrumbs={[
                        { label: 'Homepage', href: '/' },
                        { label: 'Shadowing & Dictation' },
                    ]}
                />
                {/* Collapse button — inside banner so it paints above PageHeader */}
                <button
                    onClick={toggleBanner}
                    title="Hide banner"
                    className="absolute bottom-2 right-4 z-50 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors select-none"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Show-banner button — only visible when collapsed, anchors to root relative div */}
            {bannerCollapsed && (
                <button
                    onClick={toggleBanner}
                    title="Show banner"
                    className="fixed top-[68px] right-3 z-40 p-1 text-gray-300 hover:text-gray-500 transition-colors select-none"
                >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                </button>
            )}

            {/* Content Area */}
            <div className="container mx-auto max-w-screen-xl px-4 py-4 relative">
                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        Loading lessons...
                    </div>
                ) : (
                    <>
                        {/* Video Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                            {filteredLessons.map((lesson) => (
                                <div key={lesson.id} className="flex flex-col gap-3 group">
                                    {/* Thumbnail */}
                                    <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 cursor-pointer">
                                        {lesson.youtubeVideoId ? (
                                            <img
                                                src={`https://img.youtube.com/vi/${lesson.youtubeVideoId}/maxresdefault.jpg`}
                                                alt={lesson.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                                                {/* Letter blocks */}
                                                <div className="flex gap-1.5">
                                                    {['T', 'O', 'E', 'I', 'C'].map((letter, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-8 h-10 sm:w-10 sm:h-12 bg-amber-100 border-2 border-amber-300 rounded flex items-center justify-center text-lg sm:text-xl font-bold text-gray-800 shadow-sm"
                                                            style={{ transform: `rotate(${(i - 2) * 3}deg)` }}
                                                        >
                                                            {letter}
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Scattered faint letters */}
                                                <span className="absolute top-2 left-3 text-yellow-300/40 text-2xl font-bold rotate-12">F</span>
                                                <span className="absolute bottom-2 right-3 text-yellow-300/40 text-2xl font-bold -rotate-12">R</span>
                                            </div>
                                        )}

                                        {/* Duration Badge */}
                                        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
                                            {lesson.duration}
                                        </span>
                                    </div>

                                    {/* Info Row */}
                                    <div className="flex gap-3 items-start px-1">
                                        {/* Avatar Placeholder */}
                                        <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-sm mt-0.5 overflow-hidden">
                                            {lesson.youtubeVideoId ? (
                                                <img src="https://ui-avatars.com/api/?name=YT&background=random" className="w-full h-full object-cover" />
                                            ) : (
                                                <img src="https://ui-avatars.com/api/?name=TM&background=F59E0B&color=fff" className="w-full h-full object-cover" />
                                            )}
                                        </div>

                                        {/* Text content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight pr-2">
                                                    {lesson.title}
                                                </h3>
                                                <button className="text-gray-900 opacity-0 group-hover:opacity-100 p-1 -mr-1 -mt-1 rounded-full hover:bg-gray-100 transition-all flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="text-[13px] text-gray-500 mt-1 flex flex-col gap-0.5">
                                                <p className="hover:text-gray-800 transition-colors line-clamp-1">{lesson.youtubeVideoId ? 'YouTube Content' : 'TOEIC Master'}</p>
                                                <div className="flex items-center gap-1">
                                                    <span>{Math.floor(Math.random() * 50) + 1}K views</span>
                                                    <span className="text-[10px]">•</span>
                                                    <span>{Math.floor(Math.random() * 11) + 1} months ago</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons (Hover or inline) */}
                                            <div className="flex items-center gap-2 mt-3">
                                                <Link
                                                    href={`/shadowing-dictation/${lesson.id}/shadowing`}
                                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                                    </svg>
                                                    Shadow ({progress[lesson.id]?.shadowing || 0}%)
                                                </Link>
                                                <Link
                                                    href={`/shadowing-dictation/${lesson.id}/dictation`}
                                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                                    </svg>
                                                    Dictate ({progress[lesson.id]?.dictation || 0}%)
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredLessons.length === 0 && (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🎧</div>
                                <p className="text-gray-500 text-lg">No lessons found matching your search</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                                    className="mt-4 text-primary font-semibold hover:underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
