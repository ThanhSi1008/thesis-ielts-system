const axios = require('axios');

async function main() {
  try {
    // Note: Can't test easily without a JWT token if it's protected.
    // I will mock a login or just see if the endpoint exists.
    const res = await axios.post("http://localhost:3000/api/v1/auth/login", {
      email: "admin@example.com",
      password: "password"
    });
    const token = res.data.access_token;
    
    const roadmapRes = await axios.get("http://localhost:3000/api/v1/ielts/roadmap", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Current Step:", roadmapRes.data.currentStep);
    console.log("Step 1:", JSON.stringify(roadmapRes.data.steps[0], null, 2));
    console.log("Step 2:", JSON.stringify(roadmapRes.data.steps[1], null, 2));
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

main();
