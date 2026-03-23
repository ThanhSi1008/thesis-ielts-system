import fetch from 'node-fetch';

async function run() {
  const url = 'http://localhost:3002/shadowing/videos'; // Backend is probably running on 3002 or something. Let's find out... wait, better use 3000? Let me check where the backend runs.
  
  // Actually, I can just console log
  console.log("Run this from the backend folder to see the error!");
}

run();
