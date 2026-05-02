import * as fs from 'fs';
import * as path from 'path';
import { SHADOWING_LESSONS } from './shadowing-lessons';

const outDir = path.join(__dirname, 'shadowing-lessons');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

const typesContent = `export interface ShadowingSentence {
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
    sentences: ShadowingSentence[];
}
`;
fs.writeFileSync(path.join(outDir, 'types.ts'), typesContent);

let indexContent = `import { ShadowingLesson } from './types';\n\n`;
let arrayContent = `export const SHADOWING_LESSONS: ShadowingLesson[] = [\n`;

SHADOWING_LESSONS.forEach((lesson, i) => {
    const safeTitle = lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const fileName = `lesson-${String(i+1).padStart(3, '0')}-${safeTitle}.ts`;
    const varName = `lesson${String(i+1).padStart(3, '0')}`;
    
    indexContent += `import { ${varName} } from './${fileName.replace('.ts', '')}';\n`;
    arrayContent += `    ${varName},\n`;

    const fileContent = `import { ShadowingLesson } from './types';\n\nexport const ${varName}: ShadowingLesson = ${JSON.stringify(lesson, null, 4)};\n`;
    fs.writeFileSync(path.join(outDir, fileName), fileContent);
});

arrayContent += `];\n`;
fs.writeFileSync(path.join(outDir, 'index.ts'), indexContent + '\n' + arrayContent);
