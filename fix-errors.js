const fs = require('fs');

function replaceInFile(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(path, content, 'utf8');
}

replaceInFile('backend-core/src/app.module.ts', {
    'foundationVocabWord/foundationVocabWord.module': 'vocabulary/vocabulary.module'
});

const shadowingDictationFiles = [
    'backend-core/src/modules/dictation/controllers/admin-dictation.controller.ts',
    'backend-core/src/modules/dictation/services/admin-dictation.service.ts',
    'backend-core/src/modules/shadowing/controllers/admin-shadowing.controller.ts',
    'backend-core/src/modules/shadowing/services/admin-shadowing.service.ts'
];
for (const file of shadowingDictationFiles) {
    replaceInFile(file, {
        'admin-create-foundationVocabLesson.dto': 'admin-create-lesson.dto',
        'admin-update-foundationVocabLesson.dto': 'admin-update-lesson.dto'
    });
}

const examFiles = [
    'backend-core/src/modules/exams/exams.service.ts',
    'backend-core/src/modules/users/users.service.ts',
    'backend-core/src/modules/results/results.service.ts'
];
for (const file of examFiles) {
    replaceInFile(file, {
        'ieltsIntensiveExam: {': 'exam: {',
        'ieltsIntensiveExam: true': 'exam: true',
        's.ieltsIntensiveExam': 's.exam',
        'existing.ieltsIntensiveExam': 'existing.exam',
        'ieltsIntensiveResult: {': 'result: {',
        'ieltsIntensiveResult: true': 'result: true',
        's.ieltsIntensiveResult': 's.result'
    });
}

replaceInFile('backend-core/src/modules/learning/learning.service.ts', {
    'foundationVocabWord: {': 'vocabulary: {'
});

console.log('Fixes applied.');
