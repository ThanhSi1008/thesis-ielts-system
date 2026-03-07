'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

// ──── Types ────
interface VideoLesson {
    id: string;
    title: string;
    category: string;
    thumbnailUrl: string;
    duration: string; // e.g. "1:24"
}

// ──── Sample Data ────
const CATEGORIES = ['All', 'TOEIC', 'Politics', 'Religion', 'IELTS'];

const SAMPLE_LESSONS: VideoLesson[] = [
    { id: '1', title: "Sarah's Sales Success: MVP Debate", category: 'TOEIC', thumbnailUrl: 'https://res.cloudinary.com/dalaaegob/image/upload/v1769788980/toeic_thumbnail_1_sddict.jpg', duration: '1:24' },
    { id: '2', title: "Sarah's Sales Success: MVP Debate", category: 'TOEIC', thumbnailUrl: 'https://res.cloudinary.com/dalaaegob/image/upload/v1769788980/toeic_thumbnail_1_sddict.jpg', duration: '1:24' },
    { id: '3', title: "Sarah's Sales Success: MVP Debate", category: 'TOEIC', thumbnailUrl: 'https://res.cloudinary.com/dalaaegob/image/upload/v1769788980/toeic_thumbnail_1_sddict.jpg', duration: '1:24' },
    { id: '4', title: "Sarah's Sales Success: MVP Debate", category: 'TOEIC', thumbnailUrl: 'https://res.cloudinary.com/dalaaegob/image/upload/v1769788980/toeic_thumbnail_1_sddict.jpg', duration: '1:24' },
    { id: '5', title: "Sarah's Sales Success: MVP Debate", category: 'TOEIC', thumbnailUrl: 'https://res.cloudinary.com/dalaaegob/image/upload/v1769788980/toeic_thumbnail_1_sddict.jpg', duration: '1:24' },
    { id: '6', title: "Sarah's Sales Success: MVP Debate", category: 'TOEIC', thumbnailUrl: 'https://res.cloudinary.com/dalaaegob/image/upload/v1769788980/toeic_thumbnail_1_sddict.jpg', duration: '1:24' },
];

// ──── Page Component ────
export default function ShadowingDictationPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredLessons = useMemo(() => {
        return SAMPLE_LESSONS.filter((lesson) => {
            const matchesCategory = activeCategory === 'All' || lesson.category === activeCategory;
            const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                title="Shadowing & Dictation"
                backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772877124/28d5a6da-70f6-4b0b-acc9-78cbd397dbf9.png"
                breadcrumbs={[
                    { label: 'Homepage', href: '/' },
                    { label: 'Shadowing & Dictation' },
                ]}
            />

            {/* Content Area */}
            <div className="container mx-auto max-w-screen-xl px-4 py-8">
                {/* Search Bar */}
                <div className="relative mb-6">
                    <input
                        id="search-lessons"
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button className="absolute right-0 top-0 h-full px-4 bg-gray-100 border-l border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all border ${activeCategory === category
                                ? 'bg-dark text-white border-dark'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Video Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLessons.map((lesson) => (
                        <div
                            key={lesson.id}
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            {/* Thumbnail */}
                            <div className="relative">
                                <div className="w-full aspect-video bg-primary flex items-center justify-center overflow-hidden">
                                    {/* Fallback TOEIC-style thumbnail */}
                                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center relative">
                                        {/* Letter blocks */}
                                        <div className="flex gap-1.5">
                                            {['T', 'O', 'E', 'I', 'C'].map((letter, i) => (
                                                <div
                                                    key={i}
                                                    className="w-10 h-12 bg-amber-100 border-2 border-amber-300 rounded flex items-center justify-center text-xl font-bold text-gray-800 shadow-sm"
                                                    style={{ transform: `rotate(${(i - 2) * 3}deg)` }}
                                                >
                                                    {letter}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Scattered faint letters in background */}
                                        <span className="absolute top-2 left-3 text-yellow-300/40 text-2xl font-bold rotate-12">F</span>
                                        <span className="absolute top-3 right-6 text-yellow-300/40 text-lg font-bold -rotate-6">N</span>
                                        <span className="absolute bottom-3 left-6 text-yellow-300/40 text-xl font-bold rotate-6">W</span>
                                        <span className="absolute bottom-2 right-3 text-yellow-300/40 text-2xl font-bold -rotate-12">R</span>
                                        <span className="absolute top-1 left-1/3 text-yellow-300/30 text-lg font-bold rotate-3">O</span>
                                    </div>
                                </div>

                                {/* Duration Badge */}
                                <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-semibold px-2 py-1 rounded">
                                    {lesson.duration}
                                </span>
                            </div>

                            {/* Card Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-base font-semibold text-gray-800 line-clamp-2 flex-1">
                                        {lesson.title}
                                    </h3>
                                    {/* Three-dot menu */}
                                    <button className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0 p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between">
                                    <Link
                                        href={`/shadowing-dictation/${lesson.id}/shadowing`}
                                        className="px-4 py-1.5 border-2 border-primary text-primary rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-all"
                                    >
                                        Shadowing
                                    </Link>
                                    <Link
                                        href={`/shadowing-dictation/${lesson.id}/dictation`}
                                        className="px-4 py-1.5 border-2 border-gray-300 text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all"
                                    >
                                        Dictation
                                    </Link>
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
            </div>
        </div>
    );
}
