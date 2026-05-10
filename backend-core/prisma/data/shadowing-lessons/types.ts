export interface ShadowingSentence {
    id: number;
    english: string;
    phonetic: string;
    vietnamese: string;
    words: string[];
    audioStart: number;
    audioEnd: number;
}

export interface ShadowingLesson {
    id: string;
    title: string;
    audioUrl: string;
    youtubeVideoId?: string;
    image: string;
    tags: string[];
    duration: string;
    type?: 'shadowing' | 'dictation' | 'both';
    sentences: ShadowingSentence[];
}
