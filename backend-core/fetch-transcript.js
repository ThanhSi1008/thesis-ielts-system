const { YoutubeTranscript } = require('youtube-transcript');
const fs = require('fs');

async function fetchTranscript() {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript('rSPH368zIvc');
        
        let sentences = transcript.map((item, index) => {
            const text = item.text.replace(/\n/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\[ __ \]/g, '***');
            const words = text.split(' ').filter(w => w.trim() !== '');
            // offset and duration from youtube-transcript are in milliseconds, so we convert to seconds
            const startSec = item.offset / 1000;
            const endSec = (item.offset + item.duration) / 1000;
            return {
                id: index + 1,
                english: text,
                phonetic: "",
                vietnamese: "",
                words: words,
                audioStart: Number(startSec.toFixed(2)),
                audioEnd: Number(endSec.toFixed(2))
            };
        });

        const foundationVocabLesson = {
            id: "4",
            title: "Car Accident Dating Drama",
            audioUrl: "",
            youtubeVideoId: "rSPH368zIvc",
            image: "https://img.youtube.com/vi/rSPH368zIvc/maxresdefault.jpg",
            tags: ["Shorts", "Drama"],
            duration: "2:54",
            sentences: sentences
        };

        fs.writeFileSync('transcript.json', JSON.stringify(foundationVocabLesson, null, 2));
        console.log("Successfully fetched and saved to transcript.json");
    } catch (e) {
        console.error("Error fetching transcript:", e);
    }
}
fetchTranscript();
