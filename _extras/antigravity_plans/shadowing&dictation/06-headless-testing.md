# Phase 6: Headless Testing Plan

This document outlines a strategy to verify the structural integrity and logic of the newly refactored Shadowing & Dictation modules without needing to interact with the UI via a web browser.

## 1. Static Analysis & Compilation Check

The most critical first step after a large-scale UI refactoring is ensuring there are no hidden syntax errors, missing imports, or TypeScript typing issues.

**Commands to run in the terminal:**
```bash
# Verify the frontend Next.js application compiles successfully
cd frontend-web
npm run build

# Or alternatively, run the TypeScript compiler to catch type errors only
npx tsc --noEmit
```
*Goal: Ensure that `page.tsx` for both Dictation and Shadowing perfectly imports the new components and hooks without any missing prop errors.*

## 2. Backend API Verification (cURL / Postman)

Since the monolithic backend service was split into four independent domain services, we must verify that the API routes remain intact. 

First, acquire an active JWT token. You can usually extract one from your running application's local storage or make a quick login request via cURL:

```bash
# Example login to get token (replace with actual credentials)
export TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r .access_token)
```

Then, verify the endpoints:

**A. System Lessons Controller**
```bash
# Fetch all system lessons
curl -X GET http://localhost:3001/shadowing/system-lessons \
  -H "Authorization: Bearer $TOKEN"
```

**B. User Videos Controller**
```bash
# Fetch user-specific videos
curl -X GET http://localhost:3001/shadowing/videos \
  -H "Authorization: Bearer $TOKEN"
```

**C. Folders Controller**
```bash
# Fetch user folders
curl -X GET http://localhost:3001/shadowing/folders \
  -H "Authorization: Bearer $TOKEN"
```

**D. Progress Controller**
```bash
# Fetch progress map for a user
curl -X GET http://localhost:3001/shadowing/progress \
  -H "Authorization: Bearer $TOKEN"
```
*Goal: Ensure HTTP 200 OK responses with the correctly shaped JSON payloads from all endpoints.*

## 3. Database Integrity Verification

Ensure the Prisma schema changes and seeding logic operate correctly.

```bash
cd backend-core

# Verify the database schema is in sync
npx prisma validate
npx prisma migrate status

# Check the indexed data via Prisma Studio (optional GUI) or direct query
npx prisma studio
```

If you prefer raw SQL without a GUI, you can connect to PostgreSQL using `psql`:
```sql
-- Check if the index was applied
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('shadowing_videos', 'shadowing_dictation_progress');
```

## 4. Hook Logic Testing (Unit Tests)

If you have a testing framework like Jest or Vitest configured, you can test the pure JavaScript/TypeScript logic isolated from the UI:

1. **`useLesson.ts`**: Mock `shadowingApi` and verify state transitions (`isInitializing`, `lesson`).
2. **`useProgress.ts`**: Mock `shadowingApi.upsertProgress` and ensure the internal `completedSentences` array updates correctly.
3. **`useAudioPlayer.ts`**: Mock HTML5 Audio and verify `setInterval` bounds-checking logic correctly clears when `audioEnd` is reached.

*Goal: Validate the isolated hook logic programmatically.*
