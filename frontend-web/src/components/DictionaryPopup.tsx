'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DictionaryPopupProps {
    word: string;
    sentence: string;
    position: { x: number; y: number };
    onClose: () => void;
}

type TabType = 'VI' | 'EN' | 'AI';

export default function DictionaryPopup({ word, sentence, position, onClose }: DictionaryPopupProps) {
    const [activeTab, setActiveTab] = useState<TabType>('VI');
    const [loading, setLoading] = useState(true);
    const [dictData, setDictData] = useState<any>(null);
    const [viTranslation, setViTranslation] = useState('');
    const popupRef = useRef<HTMLDivElement>(null);

    // Audio playback for pronunciation
    const playAudio = () => {
        if (dictData?.phonetics) {
            const audioObj = dictData.phonetics.find((p: any) => p.audio && p.audio.length > 0);
            if (audioObj) {
                new Audio(audioObj.audio).play();
            } else if ('speechSynthesis' in window) {
                // Fallback to TTS
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = 'en-US';
                speechSynthesis.speak(utterance);
            }
        }
    };

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Fetch data
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchData = async () => {
            try {
                // 1. Fetch free English dictionary API
                const enRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                let enData = null;
                if (enRes.ok) {
                    const json = await enRes.json();
                    enData = json[0];
                }

                // 2. Fetch Vietnamese Translation (MyMemory API - free tier)
                const viRes = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|vi`);
                let viText = '';
                if (viRes.ok) {
                    const viJson = await viRes.json();
                    viText = viJson.responseData.translatedText;
                }

                if (isMounted) {
                    setDictData(enData);
                    setViTranslation(viText);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch dictionary data", error);
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [word]);

    // Calculate safe position so it doesn't go off-screen
    const popupWidth = 360;
    const popupHeight = 400;
    const safeX = Math.min(position.x, typeof window !== 'undefined' ? window.innerWidth - popupWidth - 20 : position.x);
    const safeY = Math.min(position.y + 10, typeof window !== 'undefined' ? window.innerHeight - popupHeight - 20 : position.y);


    return (
        <div
            ref={popupRef}
            className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            style={{
                width: popupWidth,
                height: popupHeight,
                left: Math.max(20, safeX),
                top: Math.max(20, safeY)
            }}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 capitalize">{word}</h3>
                    {dictData?.phonetic && (
                        <span className="text-sm text-gray-500 font-medium">{dictData.phonetic}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={playAudio}
                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                        title="Listen to pronunciation"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white">
                <button
                    onClick={() => setActiveTab('VI')}
                    className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'VI' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                    Vietnamese
                </button>
                <button
                    onClick={() => setActiveTab('EN')}
                    className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'EN' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                    English
                </button>
                <button
                    onClick={() => setActiveTab('AI')}
                    className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1 ${activeTab === 'AI' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    AI
                </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-white">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">Looking up definition...</span>
                    </div>
                ) : (
                    <>
                        {/* Vietnamese Tab */}
                        {activeTab === 'VI' && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Translation</h4>
                                    <p className="text-lg font-medium text-gray-800">{viTranslation || 'No translation found.'}</p>
                                </div>
                            </div>
                        )}

                        {/* English Tab */}
                        {activeTab === 'EN' && (
                            <div className="space-y-6">
                                {dictData ? (
                                    dictData.meanings.map((meaning: any, i: number) => (
                                        <div key={i}>
                                            <h4 className="text-sm font-bold text-blue-600 mb-2 italic">{meaning.partOfSpeech}</h4>
                                            <ul className="space-y-3">
                                                {meaning.definitions.slice(0, 3).map((def: any, j: number) => (
                                                    <li key={j} className="text-gray-700 text-sm">
                                                        <span className="font-medium mr-1">{j + 1}.</span> {def.definition}
                                                        {def.example && (
                                                            <div className="text-gray-500 mt-1 pl-4 border-l-2 border-gray-200 italic">
                                                                "{def.example}"
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No detailed English definition found for this word.</p>
                                )}
                            </div>
                        )}

                        {/* AI Tab */}
                        {activeTab === 'AI' && (
                            <div className="space-y-5">
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 shadow-sm">
                                    <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                        Contextual Meaning
                                    </h4>
                                    <p className="text-sm text-yellow-900 leading-relaxed italic border-l-2 border-yellow-300 pl-2 mb-2">
                                        "{sentence}"
                                    </p>
                                    <p className="text-sm text-gray-700 font-medium">
                                        In this specific sentence, <strong className="text-black">{word}</strong> means {dictData?.meanings?.[0]?.definitions?.[0]?.definition?.toLowerCase() || viTranslation?.toLowerCase() || "its standard meaning"}.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">General Meaning</h4>
                                    <p className="text-sm text-gray-800">
                                        Generally, {word} refers to {dictData?.meanings?.[0]?.definitions?.[0]?.definition || viTranslation || "the concept described above"}.
                                    </p>
                                </div>

                                {dictData?.origin && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Word Origin</h4>
                                        <p className="text-sm text-gray-800">{dictData.origin}</p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Other Examples</h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {dictData?.meanings?.[0]?.definitions?.map((d: any) => d.example).filter(Boolean).slice(0, 2).map((ex: string, i: number) => (
                                            <li key={i} className="text-sm text-gray-600 italic">"{ex}"</li>
                                        ))}
                                        {(!dictData?.meanings?.[0]?.definitions?.some((d: any) => d.example)) && (
                                            <li className="text-sm text-gray-600 italic text-center list-none py-2 bg-gray-50 rounded-lg">No additional examples available.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
