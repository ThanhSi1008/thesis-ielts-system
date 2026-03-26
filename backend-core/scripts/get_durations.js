const https = require('https');

const urls = [
  'https://res.cloudinary.com/dalaaegob/video/upload/v1773917628/ELT_IELTS17_t2_audio1_xaf0r1.mp3',
  'https://res.cloudinary.com/dalaaegob/video/upload/v1773917629/ELT_IELTS17_t2_audio2_d65ewa.mp3',
  'https://res.cloudinary.com/dalaaegob/video/upload/v1773917628/ELT_IELTS17_t2_audio3_cwmdq3.mp3',
  'https://res.cloudinary.com/dalaaegob/video/upload/v1773917631/ELT_IELTS17_t2_audio4_ypz7rv.mp3'
];

async function getLength(url) {
  const infoUrl = url.replace('.mp3', '.json').replace('/upload/', '/upload/fl_getinfo/');
  return new Promise((resolve) => {
    https.get(infoUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
         try {
           const info = JSON.parse(data);
           resolve(info?.output?.duration || info?.video?.duration || info?.duration || null);
         } catch(e) { resolve(null); }
      });
    });
  });
}

(async () => {
  let total = 0;
  for (let url of urls) {
    let d = await getLength(url);
    console.log(url, d);
    if (d) total += d;
  }
  console.log("Total seconds:", total);
  console.log("Total minutes:", total / 60);
})();
