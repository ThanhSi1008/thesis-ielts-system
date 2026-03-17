const fs = require('fs');
const path = require('path');

function parseSrt(filePath) {
    const text = fs.readFileSync(filePath, 'utf-8');
    const blocks = text.trim().split(/\n\s*\n/);
    const sentences = [];

    // Time format: HH:MM:SS,mmm --> HH:MM:SS,mmm
    function timeToSeconds(timeStr) {
        const [time, ms] = timeStr.split(',');
        const [h, m, s] = time.split(':').map(Number);
        return h * 3600 + m * 60 + s + (Number(ms) / 1000);
    }

    // Normalize word function as used in the UI
    const normalizeWord = (w) => w.toLowerCase().replace(/[.,!?'"]/g, '').trim();

    for (let i = 0; i < blocks.length; i++) {
        const lines = blocks[i].split('\n');
        if (lines.length < 3) continue;

        const id = parseInt(lines[0].trim());
        const timeLine = lines[1].trim();
        const textLines = lines.slice(2).join(' ').trim();

        const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        if (!timeMatch) continue;

        const audioStart = timeToSeconds(timeMatch[1]);
        const audioEnd = timeToSeconds(timeMatch[2]);
        const words = textLines.split(/\s+/).filter(w => w.length > 0).map(w => w.trim());

        sentences.push({
            id: id,
            english: textLines,
            phonetic: '', // Leave blank for now, or just some placeholder
            vietnamese: '', // Leave blank
            words: words,
            audioStart: audioStart,
            audioEnd: audioEnd
        });
    }
    return sentences;
}

const lessons = [
    {
        id: "1",
        title: "Sarah's Sales Success: MVP Debate",
        audioUrl: "https://res.cloudinary.com/dalaaegob/video/upload/v1772874242/lesson-K5C-Rt6PJHdZNt0vkUpTp_1_lkoskg.mp3",
        image: "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        tags: ["TOEIC", "Business"],
        duration: "1:24",
        // the existing sentences are already hardcoded, we can just copy them later, or let the UI handle fallback for ID 1.
        sentences: "EXISTING_SENTENCES_PLACEHOLDER"
    },
    {
        id: "2",
        title: "Landing the Copywriter Job",
        audioUrl: "https://res.cloudinary.com/dalaaegob/video/upload/v1772889407/Landing_the_Copywriter_Job_wfbylw.mp3",
        image: "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        tags: ["TOEIC", "Interview"],
        duration: "1:03",
        sentences: parseSrt(path.join("c:/Users/Admin/Desktop/thesis/thesis-toeic-system/images/shadowing&dictation/landing.srt"))
    },
    {
        id: "3",
        title: "Menu Photo Prep for Social Media",
        audioUrl: "https://res.cloudinary.com/dalaaegob/video/upload/v1772889404/Menu_Photo_Prep_for_Social_Media_ygdo4i.mp3",
        image: "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        tags: ["TOEIC", "Social Media"],
        duration: "1:09",
        sentences: parseSrt(path.join("c:/Users/Admin/Desktop/thesis/thesis-toeic-system/images/shadowing&dictation/menu.srt"))
    },
    {
        id: "4",
        title: "Sourcing Suppliers & Travel Expenses",
        audioUrl: "https://res.cloudinary.com/dalaaegob/video/upload/v1772889407/Sourcing_Suppliers_Travel_Expenses_axr8ea.mp3",
        image: "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        tags: ["TOEIC", "Business Trip"],
        duration: "1:06",
        sentences: parseSrt(path.join("c:/Users/Admin/Desktop/thesis/thesis-toeic-system/images/shadowing&dictation/sourcing.srt"))
    },
    {
        id: "5",
        title: "Investing in Stocks A Long Term Strategy",
        audioUrl: "https://res.cloudinary.com/dalaaegob/video/upload/v1772889404/Investing_in_Stocks_A_Long_Term_Strategy_rbzrhx.mp3",
        image: "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        tags: ["TOEIC", "Finance"],
        duration: "1:07",
        sentences: parseSrt(path.join("c:/Users/Admin/Desktop/thesis/thesis-toeic-system/images/shadowing&dictation/investing.srt"))
    }
];

let output = `export interface ShadowingSentence {
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
    image: string;
    tags: string[];
    duration: string;
    sentences: ShadowingSentence[];
}

export const SHADOWING_LESSONS: ShadowingLesson[] = ${JSON.stringify(lessons, null, 4)};
`;

fs.writeFileSync("c:/Users/Admin/Desktop/thesis/thesis-toeic-system/frontend-web/src/data/shadowing-lessons.ts", output);
console.log("Done");
