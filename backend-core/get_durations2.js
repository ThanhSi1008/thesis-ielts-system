const { parseStream } = require('music-metadata');
const fetch = require('node-fetch');

const urls = [
  'https://res.cloudinary.com/dalaaegob/video/upload/v1773923257/IELTS17_t4_audio1_cbp8q6.mp3',
  'https://res.cloudinary.com/dalaaegob/video/upload/v1773923262/ELT_IELTS17_t4_audio2_yt1v8e.mp3',
  'https://res.cloudinary.com/dalaaegob/video/upload/v1773923258/ELT_IELTS17_t4_audio3_mggdln.mp3',
  'https://res.cloudinary.com/dalaaegob/video/upload/v1773923264/ELT_IELTS17_t4_audio4_kyhuxj.mp3'
];

async function getLength(url) {
  try {
    const res = await fetch(url);
    const metadata = await parseStream(res.body, { mimeType: 'audio/mpeg', size: res.headers.get('content-length') }, { duration: true });
    return metadata.format.duration;
  } catch(e) { 
    console.error(url, e);
    return null; 
  }
}

(async () => {
  let total = 0;
  for (let [idx, url] of urls.entries()) {
    let d = await getLength(url);
    console.log(`Part ${idx+1}:`, d, 'seconds');
    if (d) total += d;
  }
  console.log("Total seconds:", total);
  console.log("Total minutes:", total / 60);
})();
