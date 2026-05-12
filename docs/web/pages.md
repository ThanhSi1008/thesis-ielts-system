# Web Application Pages

This document lists all the pages (routes) available in the `frontend-web` application, organized by module. These routes are based on the Next.js App Router structure in `frontend-web/src/app`.

## Core & Authentication
- `/` - Home Page
- `/login` - Login Page
- `/register` - Registration Page
- `/profile` - User Profile Page
- `/pricing` - Pricing Plans
- `/community` - General Community Hub

## Vocab Lab
- `/vocab-lab` - Vocab Lab Dashboard (My Decks)
- `/vocab-lab/study/[deckId]` - Study session for a specific deck
- `/vocab-lab/community` - Community shared decks

## Shadowing & Dictation
- `/shadowing-dictation` - Main hub for Shadowing and Dictation
- `/shadowing-dictation/shadowing` - List of Shadowing lessons
- `/shadowing-dictation/shadowing/[id]` - Specific Shadowing lesson
- `/shadowing-dictation/shadowing/my-videos` - User's recorded shadowing videos
- `/shadowing-dictation/dictation` - List of Dictation lessons
- `/shadowing-dictation/dictation/[id]` - Specific Dictation lesson
- `/shadowing-dictation/dictation/my-videos` - User's recorded dictation videos

## IELTS Hub
- `/ielts` - IELTS Main Hub
- `/ielts/dashboard` - IELTS Student Dashboard
- `/ielts/statistics` - General IELTS Statistics
- `/ielts/history` - Exam and Practice History
- `/ielts/roadmap` - Learning Roadmap
- `/ielts/calculator` - IELTS Score Calculator

### IELTS Intensive
- `/ielts/intensive` - List of full simulated exams
- `/ielts/intensive/[examId]` - Exam overview and instructions
- `/ielts/intensive/[examId]/start` - Exam starting screen
- `/ielts/intensive/[examId]/take/[sessionId]` - Real-time exam taking interface
- `/ielts/intensive/[examId]/practice/[sessionId]` - Practice mode for exam
- `/ielts/intensive/[examId]/result/[sessionId]` - Detailed result analysis

### IELTS Advanced (Skill-based)
- `/ielts/advanced` - Advanced practice hub
- `/ielts/advanced/statistics` - Advanced statistics
- `/ielts/advanced/reading/[partId]` - Reading part practice
- `/ielts/advanced/reading/[partId]/my-answers` - Reading answer history
- `/ielts/advanced/reading/[partId]/my-answers/[sessionId]` - Specific reading result
- `/ielts/advanced/listening/[partId]` - Listening part practice
- `/ielts/advanced/listening/[partId]/my-answers` - Listening answer history
- `/ielts/advanced/listening/[partId]/my-answers/[sessionId]` - Specific listening result
- `/ielts/advanced/speaking` - Speaking hub
- `/ielts/advanced/speaking/[partId]` - Speaking part practice with AI
- `/ielts/advanced/speaking/[partId]/my-answers` - Speaking answer history
- `/ielts/advanced/speaking/[partId]/result/[sessionId]` - Specific speaking result analysis
- `/ielts/advanced/speaking/[partId]/community` - Community shared speaking answers
- `/ielts/advanced/writing/[promptId]` - Writing part practice with AI
- `/ielts/advanced/writing/[promptId]/my-answers` - Writing answer history
- `/ielts/advanced/writing/[promptId]/result/[sessionId]` - Specific writing result analysis
- `/ielts/advanced/writing/[promptId]/community` - Community shared writing answers

### IELTS Basic
- `/ielts/basic` - Basic learning hub
- `/ielts/basic/onboarding` - Onboarding for beginners
- `/ielts/basic/roadmap` - Basic learning roadmap
- `/ielts/basic/library` - Library of resources
- `/ielts/basic/[skill]/lessons` - List of lessons for a skill
- `/ielts/basic/[skill]/lessons/[lessonId]` - Specific lesson content
- `/ielts/basic/[skill]/exercises` - List of exercises for a skill
- `/ielts/basic/[skill]/exercises/[exerciseId]` - Specific exercise interface

### IELTS Grammar, Vocabulary & Pronunciation
- `/ielts/grammar` - IELTS Grammar hub
- `/ielts/grammar/[topicSlug]` - Grammar topic overview
- `/ielts/grammar/[topicSlug]/[lessonSlug]` - Specific grammar lesson
- `/ielts/vocabulary` - IELTS Vocabulary hub
- `/ielts/vocabulary/[bookSlug]` - Vocabulary book overview
- `/ielts/vocabulary/[bookSlug]/[unitSlug]` - Specific unit
- `/ielts/pronunciation` - IELTS Pronunciation hub
- `/ielts/pronunciation/sounds/[symbol]` - Specific sound practice

## General English Learning
- `/vocabulary` - General Vocabulary hub
- `/vocabulary/[bookSlug]` - Book overview
- `/vocabulary/[bookSlug]/[unitSlug]` - Specific unit
- `/grammar` - General Grammar hub
- `/pronunciation` - General Pronunciation hub
- `/pronunciation/[lessonSlug]` - Specific lesson
- `/pronunciation/sounds/[symbol]` - Specific sound practice
- `/lessons` - General lessons list
- `/lessons/[id]` - Specific lesson content

## Student-Teacher
- `/ielts/student-teacher` - Main hub for teachers to manage students
- `/ielts/student-teacher/student/[studentId]` - Detailed view of a specific student's progress

## Payment
- `/payment/vnpay-return` - Callback handler for VNPay payment gateway

## Admin Panel
- `/admin` - Admin Dashboard
- `/admin/subscriptions` - Manage user subscriptions and payments
- `/admin/shadowing` - Manage Shadowing lessons
- `/admin/shadowing/new` - Create new Shadowing lesson
- `/admin/shadowing/[id]/edit` - Edit Shadowing lesson
- `/admin/dictation` - Manage Dictation lessons
- `/admin/dictation/new` - Create new Dictation lesson
- `/admin/dictation/[id]/edit` - Edit Dictation lesson
