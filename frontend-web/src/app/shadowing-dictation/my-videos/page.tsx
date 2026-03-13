'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { ShadowingSentence } from '@/data/shadowing-lessons';
import { parseSrtToSentences, extractYouTubeVideoId } from '@/utils/parseSrt';

// ── Types ──
interface MyVideo {
    id: string;
    title: string;
    youtubeVideoId: string;
    folder: string;
    category: string;
    duration: string;
    sentences: ShadowingSentence[];
    createdAt: string;
}

// ── LocalStorage helpers ──
function loadVideos(): MyVideo[] {
    try {
        const raw = localStorage.getItem('my_videos');
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveVideos(videos: MyVideo[]) {
    localStorage.setItem('my_videos', JSON.stringify(videos));
}

function loadFolders(): string[] {
    try {
        const raw = localStorage.getItem('my_video_folders');
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveFolders(folders: string[]) {
    localStorage.setItem('my_video_folders', JSON.stringify(folders));
}

// ── Category options ──
const CATEGORY_OPTIONS = ['Religion', 'Science', 'Education', 'Technology', 'Entertainment', 'News', 'Other'];

// ── Page Component ──
export default function MyVideosPage() {
    const [videos, setVideos] = useState<MyVideo[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [activeFolder, setActiveFolder] = useState('All Videos');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFolderInput, setShowFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [progress, setProgress] = useState<Record<string, { shadowing: number; dictation: number }>>({});
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // Create modal state
    const [ytLink, setYtLink] = useState('');
    const [srtContent, setSrtContent] = useState('');
    const [srtFileName, setSrtFileName] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('All Videos');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    // Load data on mount
    useEffect(() => {
        setVideos(loadVideos());
        setFolders(loadFolders());
    }, []);

    // Load progress
    useEffect(() => {
        const newProgress: Record<string, { shadowing: number; dictation: number }> = {};
        videos.forEach(v => {
            let shadowingCount = 0;
            let dictationCount = 0;
            try {
                const s = localStorage.getItem(`shadowing_progress_${v.id}`);
                if (s) { const p = JSON.parse(s); if (Array.isArray(p)) shadowingCount = p.length; }
                const d = localStorage.getItem(`dictation_progress_${v.id}`);
                if (d) { const p = JSON.parse(d); if (Array.isArray(p)) dictationCount = p.length; }
            } catch { }
            const total = v.sentences.length;
            newProgress[v.id] = {
                shadowing: total > 0 ? Math.round((shadowingCount / total) * 100) : 0,
                dictation: total > 0 ? Math.round((dictationCount / total) * 100) : 0,
            };
        });
        setProgress(newProgress);
    }, [videos]);

    // Filtered videos
    const filteredVideos = useMemo(() => {
        return videos.filter(v => {
            const matchesFolder = activeFolder === 'All Videos' || v.folder === activeFolder;
            const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFolder && matchesSearch;
        });
    }, [videos, activeFolder, searchQuery]);

    // Folder video counts
    const folderCounts = useMemo(() => {
        const counts: Record<string, number> = { 'All Videos': videos.length };
        folders.forEach(f => { counts[f] = videos.filter(v => v.folder === f).length; });
        return counts;
    }, [videos, folders]);

    // ── Handle SRT file upload ──
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSrtFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setSrtContent(ev.target?.result as string || '');
        };
        reader.readAsText(file);
    }, []);

    // ── Create Video ──
    const handleCreateVideo = useCallback(() => {
        setCreateError('');

        // Validate
        const videoId = extractYouTubeVideoId(ytLink);
        if (!videoId) { setCreateError('Invalid YouTube URL'); return; }
        if (!srtContent.trim()) { setCreateError('Please upload an SRT transcript file'); return; }

        setIsCreating(true);

        try {
            const sentences = parseSrtToSentences(srtContent);
            if (sentences.length === 0) { setCreateError('Could not parse any sentences from the SRT file'); setIsCreating(false); return; }

            // Calculate duration from last sentence
            const lastEnd = sentences[sentences.length - 1].audioEnd;
            const mins = Math.floor(lastEnd / 60);
            const secs = Math.floor(lastEnd % 60);
            const duration = `${mins}:${secs.toString().padStart(2, '0')}`;

            const newVideo: MyVideo = {
                id: `my-${Date.now()}`,
                title: videoTitle.trim() || 'Untitled Video',
                youtubeVideoId: videoId,
                folder: selectedFolder,
                category: selectedCategory || 'Other',
                duration,
                sentences,
                createdAt: new Date().toISOString(),
            };

            const updated = [...videos, newVideo];
            setVideos(updated);
            saveVideos(updated);

            // Reset modal
            setYtLink('');
            setSrtContent('');
            setSrtFileName('');
            setVideoTitle('');
            setSelectedFolder('All Videos');
            setSelectedCategory('');
            setShowCreateModal(false);
        } catch {
            setCreateError('Failed to parse the SRT file');
        }
        setIsCreating(false);
    }, [ytLink, srtContent, videoTitle, selectedFolder, selectedCategory, videos]);

    // ── Add folder ──
    const handleAddFolder = useCallback(() => {
        const name = newFolderName.trim();
        if (!name || folders.includes(name)) return;
        const updated = [...folders, name];
        setFolders(updated);
        saveFolders(updated);
        setNewFolderName('');
        setShowFolderInput(false);
    }, [newFolderName, folders]);

    // ── Delete video ──
    const handleDeleteVideo = useCallback((id: string) => {
        const updated = videos.filter(v => v.id !== id);
        setVideos(updated);
        saveVideos(updated);
        setMenuOpenId(null);
    }, [videos]);

    // ── Move to folder ──
    const handleMoveToFolder = useCallback((id: string, folder: string) => {
        const updated = videos.map(v => v.id === id ? { ...v, folder } : v);
        setVideos(updated);
        saveVideos(updated);
        setMenuOpenId(null);
    }, [videos]);

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                title="My Videos"
                backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772877124/28d5a6da-70f6-4b0b-acc9-78cbd397dbf9.png"
                breadcrumbs={[
                    { label: 'Homepage', href: '/' },
                    { label: 'Shadowing & Dictation', href: '/shadowing-dictation' },
                    { label: 'My Videos' },
                ]}
            />

            <div className="container mx-auto max-w-screen-xl px-4 py-8">
                <div className="flex gap-8">
                    
                    {/* ══ LEFT SIDEBAR ══ */}
                    <div className="w-72 flex-shrink-0">
                        {/* Upload Videos */}
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Videos</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-base shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Create
                        </button>

                        {/* Folder Section */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-bold text-gray-800">Folder</h2>
                                <button
                                    onClick={() => setShowFolderInput(!showFolderInput)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>

                            {/* Add folder input */}
                            {showFolderInput && (
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Folder name"
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddFolder()}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleAddFolder}
                                        className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}

                            {/* Folder list */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => setActiveFolder('All Videos')}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        activeFolder === 'All Videos'
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        All Videos
                                    </span>
                                    <span className="text-xs text-gray-400">({folderCounts['All Videos'] || 0})</span>
                                </button>

                                {folders.map(folder => (
                                    <button
                                        key={folder}
                                        onClick={() => setActiveFolder(folder)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                            activeFolder === folder
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                            {folder}
                                        </span>
                                        <span className="text-xs text-gray-400">({folderCounts[folder] || 0})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ══ MAIN CONTENT ══ */}
                    <div className="flex-1 min-w-0">
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            <button className="absolute right-0 top-0 h-full px-4 bg-gray-100 border-l border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Video Cards Grid */}
                        {filteredVideos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredVideos.map(video => (
                                    <div
                                        key={video.id}
                                        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative">
                                            <div className="w-full aspect-video bg-gray-100 overflow-hidden">
                                                <img
                                                    src={`https://img.youtube.com/vi/${video.youtubeVideoId}/maxresdefault.jpg`}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-semibold px-2 py-1 rounded">
                                                {video.duration}
                                            </span>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-base font-semibold text-gray-800 line-clamp-2 flex-1">
                                                    {video.title}
                                                </h3>
                                                {/* Three-dot menu */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setMenuOpenId(menuOpenId === video.id ? null : video.id)}
                                                        className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0 p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>
                                                    {menuOpenId === video.id && (
                                                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[160px]">
                                                            {folders.length > 0 && (
                                                                <div className="px-3 py-1.5 text-xs text-gray-400 font-semibold uppercase">Move to</div>
                                                            )}
                                                            {folders.map(f => (
                                                                <button
                                                                    key={f}
                                                                    onClick={() => handleMoveToFolder(video.id, f)}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    📁 {f}
                                                                </button>
                                                            ))}
                                                            {folders.length > 0 && <div className="border-t border-gray-100 my-1" />}
                                                            <button
                                                                onClick={() => handleDeleteVideo(video.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div className="mb-4 space-y-2">
                                                <div>
                                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                        <span>Shadowing</span>
                                                        <span className="font-medium">{progress[video.id]?.shadowing || 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progress[video.id]?.shadowing || 0}%` }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                        <span>Dictation</span>
                                                        <span className="font-medium">{progress[video.id]?.dictation || 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-gray-800 h-full rounded-full transition-all duration-500" style={{ width: `${progress[video.id]?.dictation || 0}%` }} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/shadowing-dictation/${video.id}/shadowing`}
                                                    className="group flex flex-1 items-center justify-center gap-1.5 py-2 border-2 border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:scale-125">
                                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                                    </svg>
                                                    Shadowing
                                                </Link>
                                                <Link
                                                    href={`/shadowing-dictation/${video.id}/dictation`}
                                                    className="group flex flex-1 items-center justify-center gap-1.5 py-2 border-2 border-gray-800 text-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:text-white transition-all"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:scale-125">
                                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                                    </svg>
                                                    Dictation
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🎬</div>
                                <p className="text-gray-500 text-lg mb-2">
                                    {videos.length === 0 ? 'No videos yet' : 'No videos found matching your search'}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {videos.length === 0
                                        ? 'Click "+ Create" to add a YouTube video for practice'
                                        : 'Try a different search term or folder'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══ CREATE VIDEO MODAL ══ */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateModal(false)}>
                    <div
                        className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-lg font-bold text-center text-gray-800 uppercase tracking-wide mb-6">
                            Paste YouTube Link in Here to Start
                        </h2>

                        {/* YouTube Link */}
                        <div className="mb-5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                Youtube Link
                            </label>
                            <input
                                type="text"
                                placeholder="Paste Youtube link in here to start"
                                value={ytLink}
                                onChange={e => setYtLink(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Video Title */}
                        <div className="mb-5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Video Title
                            </label>
                            <input
                                type="text"
                                placeholder="Enter a title for the video"
                                value={videoTitle}
                                onChange={e => setVideoTitle(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Transcript */}
                        <div className="mb-5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Transcript
                            </label>
                            <div className="flex border border-gray-300 bg-white rounded-lg overflow-hidden">
                                <div className="flex-1 px-4 py-3 text-gray-500 text-sm truncate">
                                    {srtFileName || 'Choose file'}
                                </div>
                                <label className="px-6 py-3 bg-gray-100 border-l border-gray-300 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors flex items-center">
                                    Browse
                                    <input
                                        type="file"
                                        accept=".srt,.txt"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Folder */}
                        <div className="mb-5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                Folder
                            </label>
                            <select
                                value={selectedFolder}
                                onChange={e => setSelectedFolder(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                            >
                                <option value="All Videos">All Videos</option>
                                {folders.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                            >
                                <option value="">Choose Category</option>
                                {CATEGORY_OPTIONS.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Error */}
                        {createError && (
                            <p className="text-red-600 text-sm mb-4 text-center">{createError}</p>
                        )}

                        {/* Create Button */}
                        <button
                            onClick={handleCreateVideo}
                            disabled={isCreating}
                            className="w-full max-w-xs mx-auto block py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M12 3l1.912 5.813h6.113l-4.969 3.602 1.912 5.813L12 14.626l-4.968 3.602 1.912-5.813L4 8.813h6.113z" />
                            </svg>
                            {isCreating ? 'Creating...' : 'Create Video'}
                        </button>
                    </div>
                </div>
            )}

            {/* Click-outside handler for menus */}
            {menuOpenId && (
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
            )}
        </div>
    );
}
