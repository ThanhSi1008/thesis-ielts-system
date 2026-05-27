# 07 — Detailed Thesis Demo Script (E2E Manual Testing Scenario)

This document provides a highly professional, step-by-step English demonstration script designed for a thesis defense or a product walkthrough. It guides the presenter or reviewer through testing the **Admin Exam Builder (Staging Queue)** and the **Sequential FULL_TEST Student Player** on the browser UI.

---

## 🛠️ Environment Preparation & Prerequisites

Before starting the live demonstration, ensure that all local services are initialized and running properly.

### 1. Start the Docker Infrastructure
Open a terminal at the root of the project (`thesis-ielts-system`) and spin up the database, cache, message broker, and storage services:
```bash
docker compose up -d
```
Verify that Postgres, Redis, RabbitMQ, and MinIO are healthy by running `docker ps`.

### 2. Seed the Database
Ensure the database has fresh, default administration credentials, quota systems, premium mock plans, and default mock exams:
```bash
cd backend-core
npm run prisma:seed
```

### 3. Launch Local Services
Open three separate terminal windows or run them in your development stack:

*   **Terminal 1 — Backend Core (NestJS Core API):**
    ```bash
    cd backend-core
    npm run dev
    ```
    *Core API running at:* `http://localhost:3000`

*   **Terminal 2 — Backend AI (Python FastAPI Service):**
    ```bash
    cd backend-ai
    source venv/bin/activate
    # Install dependencies (only required once)
    pip install -r requirements.txt
    # Start the service
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
    *AI Worker API running at:* `http://localhost:8000`

*   **Terminal 3 — Frontend Web (Next.js client-side application):**
    ```bash
    cd frontend-web
    npm run dev
    ```
    *Web App Interface accessible at:* `http://localhost:3001`

---

## 📋 Scenario 1: Admin Exam Import & Staging Queue (Admin Flow)

**Objective**: Log in as an Administrator, import a new 4-skill `FULL_TEST` exam from a PDF file, and monitor the asynchronous scraping and AI extraction pipeline in the Staging Queue.

### Step 1: Log in to the Admin Dashboard
1. Open the browser and go to `http://localhost:3001/login`.
2. Enter the administrator credentials:
    *   **Email:** `admin@example.com`
    *   **Password:** `123456`
3. Click **Login** and confirm redirection to the **Admin Dashboard**.

### Step 2: Access the IELTS Intensive Administration Panel
1. Click **IELTS Intensive** under the Admin group in the left-hand sidebar navigation.
2. Confirm the presence of the live exams table at the top and the **Import Queue (Staging Queue)** at the bottom.

### Step 3: Trigger a New PDF Import
1. Click the **"New Import"** button in the top-right corner of the interface.
2. A beautiful right-hand slide-out drawer will appear. Configure the fields as follows:
    *   **Target Skill *:** Select `FULL_TEST (All 4 Skills)`.
    *   **Source Type:** Select `PDF File Drop` (default).
    *   **Source Publisher:** Select `Cambridge IELTS`.
    *   **Book Number:** Enter `18`.
    *   **Test Number:** Enter `1`.
3. Drag and drop a standard Cambridge IELTS 18 Test 1 exam PDF into the dotted `Drag or drop PDF file here` dropzone area (or click **Select PDF** to select it locally).
4. Click the yellow **"Submit Import"** button at the bottom-right corner of the drawer.

### Step 4: Monitor the Asynchronous Processing Pipeline
1. Observe that the drawer slides closed, and **4 separate jobs** (Listening, Reading, Writing, Speaking) are instantaneously added to the **Import Queue** sharing a single `Group ID`.
2. Watch the live **Status** badges transition automatically in real-time without full-page reloads:
    *   `PENDING` (Waiting in RabbitMQ queue) $\rightarrow$ `SCRAPING` (Downloading raw PDF and audio files) $\rightarrow$ `EXTRACTING` (Engaging Gemini AI to intelligently extract structured schemas) $\rightarrow$ `AWAITING_REVIEW` (Ready for manual administrative verification).
3. *Expected extraction runtime: 1–2 minutes for the entire 4-skill group.*

---

## 📋 Scenario 2: Editorial Review & Interactive Editor (Editorial Flow)

**Objective**: Review AI-parsed question nodes, demonstrate instant synchronization between the Visual Form and JSON view, test safety validations, add question timestamps for audio sections, and publish the compiled `FULL_TEST`.

### Step 1: Launch the Full-Screen Review Editor
1. Once the **Listening** job turns to the green `AWAITING_REVIEW` state, click the **"Review"** button in its table row.
2. A premium full-screen modal with a sophisticated blur effect (`backdrop-blur-sm`) will open, loading all AI-structured questions.

### Step 2: Test Visual & Code Synchronicity
1. Alternate between the **"Visual Form"** and **"JSON"** tabs.
2. In the **Visual Form** tab, modify a question text (e.g., change the title header of Part 1).
3. Switch back to the **JSON** tab and verify that the raw JSON structure has instantly updated to reflect your manual change.

### Step 3: Verify the Safety Grid (Grader-Compatibility Safeguard)
1. In the **JSON** tab, deliberately delete the `"answer"` property of any question block.
2. Click **"Save Draft"** or attempt to validate.
3. Verify that the UI throws a structured **Grader-Compatibility Validation Alert (422 Unprocessable Entity)** detailing the missing answers, preventing administrators from publishing corrupted exams to students.
4. Undo your breaking change (or click cancel/reload) to restore the correct schema structure.

### Step 4: Set Audio Question Timestamps (Listening Only)
1. In the **Visual Form** tab, locate the integrated audio player.
2. Play the audio file to confirm it was automatically retrieved by the media pipeline.
3. For a couple of questions, enter sample timestamps in the timestamp input boxes (e.g., `01:25` for Q1, `03:40` for Q2).
4. *These timestamps will act as interactive quick-links for students during their review.*

### Step 5: Save Draft & Perform Group Commit
1. Click **"Save Draft"** to persist your edits. Notice the modal closes and preserves your changes, keeping the state as `AWAITING_REVIEW`.
2. Take a brief look at the **Reading** or **Writing** review screens to show off their layouts:
    *   **Reading**: Features a balanced split-pane container displaying the passage on the left and input questions on the right.
    *   **Writing**: Renders Tasks 1 & 2 with beautifully extracted high-resolution charts and images.
3. Under the **Import Queue**, click the yellow **"Commit Group"** button next to your group's ID.
4. Verify:
    *   All 4 staging jobs are moved to the black/grey `COMMITTED` status.
    *   A consolidated live exam titled **"Cambridge IELTS 18 - Test 1"** immediately appears in the **Live Exams** table with a type badge of `FULL_TEST`.

---

## 📋 Scenario 3: Sequential Exam Player & Resiliency (Student Flow)

**Objective**: Log in as a student, initiate the newly committed `FULL_TEST`, progress sequentially through all 4 skills, save answer progress in the background, and demonstrate the robust exam auto-resume capability.

### Step 1: Log in as a Student
1. Navigate back to `http://localhost:3001/login` (log out from the admin account first).
2. Enter the student credentials:
    *   **Email:** `student@example.com`
    *   **Password:** `123456`
3. Direct your browser to the student intensive catalog: `http://localhost:3001/ielts/intensive`.

### Step 2: Start the sequential FULL_TEST
1. Locate **"Cambridge IELTS 18 - Test 1"** in the list.
2. Click **"Take Exam"**.
3. Confirm you enter the dedicated **IELTS Exam Interface** in **Listening Mode**:
    *   The continuous audio track begins streaming.
    *   A countdown timer starts at exactly **40:00** minutes.
    *   The page header displays: `Cambridge IELTS 18 - Test 1 - Listening`.

### Step 3: Answer Questions & Progress to Reading
1. Enter mock answers into the first few listening fields.
2. Click the **"Next Section (Reading)"** button in the top-right corner (or wait for the timer to reach zero).
3. Confirm that:
    *   The UI transitions seamlessly to the **Reading Split-Pane Layout** without full-page reloads.
    *   The countdown timer is reset to exactly **60:00** minutes.
    *   The page header updates to: `Cambridge IELTS 18 - Test 1 - Reading`.
    *   The Listening answers have been sent to the server in the background via `saveSessionProgress`.

### Step 4: Demonstrate Auto-Resume Resiliency
1. While on the Reading section, type some test answers (e.g., choosing `A` for Q1 and `false` for Q2).
2. **Simulate a Crash**: Force refresh the page (`F5`/`Cmd+R`) or close the tab entirely and re-navigate back to the exam URL.
3. **Verify Restoration**:
    *   Observe that the system detects the active session, bypassing the Listening introduction page and taking you directly back to the **Reading Split-Pane Layout**!
    *   All previously selected answers (both Listening and Reading) are fully restored on the UI.
    *   The timer resumes from the exact second you left off.

### Step 5: Advance to Writing & Speaking
1. Click **"Next Section (Writing)"**. Write a short test essay inside the response textareas for Task 1 and Task 2.
2. Click **"Next Section (Speaking)"**.
    *   Grant the browser permission to access your microphone.
    *   Click **Record** to answer Speaking Part 1. Verify the dynamic, real-time waveform animator displays your voice frequencies.
    *   Stop recording and verify the recorded clip is temporarily cached.

---

## 📋 Scenario 4: Real-Time AI Grading & Score Report (Grading Flow)

**Objective**: Submit the complete test session, observe the premium real-time AI processing loader, and review the merged score report combining instant automated L/R marking and deep multi-criteria AI-evaluated W/S feedback.

### Step 1: Submit the Completed Exam
1. On the Speaking section, click the **"Finish & Submit"** button.
2. A stylish confirmation modal will appear. Confirm the submission by clicking **"Yes, Submit"**.

### Step 2: View the Premium AI Grading Overlay
1. Observe the screen transition to a sophisticated frosted-glass dark overlay with a smooth spinner indicator.
2. The user is greeted with a supportive message:
   `"Calculating your score... Our AI examiner is grading your responses. This may take a minute."`
3. *Technical Highlight*: Behind the scenes, RabbitMQ distributes the Writing and Speaking submissions to the Python AI worker. The worker transcribes the Speaking audio using OpenAI Whisper, then sends both text streams to Gemini with strict guidelines to evaluate spelling, grammar, vocabulary, coherence, and target performance criteria.

### Step 3: Analyze the Unified Score Report
1. Once grading finishes (typically 30–45 seconds), the interface automatically redirects you to the report page: `http://localhost:3001/ielts/intensive/[examId]/result/[sessionId]`.
2. Confirm the highly visual layout of the unified feedback cards:
    *   **Listening Score**: Shows your exact raw mark (e.g., `38 / 40`) and corresponding Band score.
    *   **Reading Score**: Shows your exact raw mark (e.g., `36 / 40`) and corresponding Band score.
    *   **Writing Band**: Shows the AI-calculated overall Band (e.g., `7.5`). Click the card to open a modal detailing grades and constructive remarks for all 4 official IELTS writing criteria (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).
    *   **Speaking Band**: Shows the AI-calculated overall Band (e.g., `7.0`). Click the card to access the transcribed script, listen to your recorded responses, and view inline suggestions highlighting pronunciation or grammar flaws.
3. Ensure that Listening and Reading answers are graded exactly by system keys and not overwritten by AI guesses, presenting a flawless, unified view of the exam results.

---

*Good luck with your thesis presentation! This comprehensive demo flow is sure to impress the review committee with its seamless automation, robust fallback logic, and premium design.*
