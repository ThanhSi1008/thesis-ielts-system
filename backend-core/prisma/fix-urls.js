const fs = require('fs');
const filePath = 'prisma/data/foundationVocabWord.ts';

let content = fs.readFileSync(filePath, 'utf8');

// The regex we want to match is /data/unit-[number]-[slug]/wordlist/
// And we want to replace it with /data/unit-[number]/wordlist/
// Using match groups for the number.
const regex = /\/data\/unit-(\d+)-[^\/]+\/wordlist\//g;

// Execute the replace
const newContent = content.replace(regex, '/data/unit-$1/wordlist/');

// Check numbers before writing
const beforeCount = (content.match(regex) || []).length;
const afterCount = (newContent.match(regex) || []).length;

const withNumber = (newContent.match(/\/data\/unit-\d+\/wordlist\//g) || []).length;

console.log('URLs to replace:', beforeCount);
console.log('URLs matched the new pattern:', withNumber);

if (beforeCount > 0 && afterCount === 0 && withNumber >= beforeCount) {
    fs.writeFileSync(filePath, newContent);
    console.log('File successfully updated.');
} else {
    console.log('Something went wrong, file NOT written.');
    console.log('Broken after replacement:', afterCount);
}
