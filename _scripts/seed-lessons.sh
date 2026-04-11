#!/bin/bash

# TOEIC Master AI - Lesson Seeding Script
# Creates multiple lessons with vocabulary and grammar

set -e

API_URL="http://localhost:3000/api/v1"
TOKEN_FILE="/tmp/toeic_token.txt"

if [ ! -f "$TOKEN_FILE" ]; then
    echo "❌ Token file not found. Please login first."
    exit 1
fi

TOKEN=$(cat $TOKEN_FILE)

echo "🌱 Starting lesson seeding..."
echo "Using token: ${TOKEN:0:20}..."

# Function to create lesson
create_lesson() {
    local title="$1"
    local desc="$2"
    local difficulty="$3"
    local order="$4"
    
    echo "📚 Creating lesson: $title"
    curl -s -X POST "$API_URL/learning/lessons" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{
            \"title\": \"$title\",
            \"description\": \"$desc\",
            \"difficulty\": \"$difficulty\",
            \"order\": $order,
            \"isPublished\": true
        }" | jq -r '.id'
}

# Function to add vocabulary
add_vocabulary() {
    local lesson_id="$1"
    local word="$2"
    local meaning="$3"
    local ipa="$4"
    local example="$5"
    local pos="$6"
    
    curl -s -X POST "$API_URL/learning/vocabulary" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{
            \"lessonId\": \"$lesson_id\",
            \"word\": \"$word\",
            \"meaning\": \"$meaning\",
            \"ipa\": \"$ipa\",
            \"example\": \"$example\",
            \"partOfSpeech\": \"$pos\"
        }" > /dev/null
    echo "  ✓ Added: $word"
}

# Function to add grammar
add_grammar() {
    local lesson_id="$1"
    local title="$2"
    local rule="$3"
    local example="$4"
    
    curl -s -X POST "$API_URL/learning/grammar" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{
            \"lessonId\": \"$lesson_id\",
            \"title\": \"$title\",
            \"rule\": \"$rule\",
            \"example\": \"$example\"
        }" > /dev/null
    echo "  ✓ Added grammar: $title"
}

# Lesson 2: Introducing Yourself
LESSON_ID=$(create_lesson \
    "Introducing Yourself" \
    "Learn how to introduce yourself professionally in English" \
    "BEGINNER" \
    "2")

add_vocabulary "$LESSON_ID" "name" "A word by which a person is known" "/neɪm/" "My name is John Smith." "noun"
add_vocabulary "$LESSON_ID" "work" "To do a job or activity" "/wɜːrk/" "I work at Google." "verb"
add_vocabulary "$LESSON_ID" "company" "A business organization" "/ˈkʌmpəni/" "She works for a tech company." "noun"
add_vocabulary "$LESSON_ID" "pleased" "Feeling happy or satisfied" "/pliːzd/" "Pleased to meet you!" "adjective"
add_vocabulary "$LESSON_ID" "meet" "To come together with someone" "/miːt/" "Nice to meet you." "verb"

add_grammar "$LESSON_ID" "Present Simple for Self-Introduction" \
    "Use present simple (I am, I work, I have) for stating facts about yourself." \
    "I am Sarah. I work as a teacher. I have two children."

# Lesson 3: Numbers and Time
LESSON_ID=$(create_lesson \
    "Numbers and Time" \
    "Master numbers, dates, and time expressions for TOEIC" \
    "BEGINNER" \
    "3")

add_vocabulary "$LESSON_ID" "time" "The measured period" "/taɪm/" "What time is it?" "noun"
add_vocabulary "$LESSON_ID" "hour" "A period of 60 minutes" "/aʊər/" "The meeting is one hour long." "noun"
add_vocabulary "$LESSON_ID" "minute" "A period of 60 seconds" "/ˈmɪnɪt/" "Wait a minute, please." "noun"
add_vocabulary "$LESSON_ID" "early" "Before the expected time" "/ˈɜːrli/" "I arrived early for the interview." "adverb"
add_vocabulary "$LESSON_ID" "late" "After the expected time" "/leɪt/" "Sorry I'm late!" "adjective"

add_grammar "$LESSON_ID" "Telling Time" \
    "Use 'It's' + time. For times after 30 minutes, use 'to' the next hour." \
    "It's 3:15 (three fifteen). It's quarter to four (3:45)."

# Lesson 4: Office Vocabulary
LESSON_ID=$(create_lesson \
    "Office Vocabulary" \
    "Essential vocabulary for office and workplace communication" \
    "INTERMEDIATE" \
    "4")

add_vocabulary "$LESSON_ID" "schedule" "A plan of activities or events" "/ˈskedʒuːl/" "Let me check my schedule." "noun"
add_vocabulary "$LESSON_ID" "meeting" "A gathering of people" "/ˈmiːtɪŋ/" "We have a meeting at 2 PM." "noun"
add_vocabulary "$LESSON_ID" "deadline" "The latest time by which something must be completed" "/ˈdedlaɪn/" "The deadline is next Friday." "noun"
add_vocabulary "$LESSON_ID" "colleague" "A person you work with" "/ˈkɒliːɡ/" "My colleague helped me with the project." "noun"
add_vocabulary "$LESSON_ID" "report" "A written document giving information" "/rɪˈpɔːrt/" "Please submit your report by Monday." "noun"

add_grammar "$LESSON_ID" "Formal Email Expressions" \
    "Use formal language in business emails: Dear, I would like to, Could you please, Best regards." \
    "Dear Mr. Smith, I would like to schedule a meeting. Could you please confirm? Best regards, Jane"

# Lesson 5: Making Requests
LESSON_ID=$(create_lesson \
    "Making Requests" \
    "Learn polite ways to ask for things in professional contexts" \
    "INTERMEDIATE" \
    "5")

add_vocabulary "$LESSON_ID" "request" "To ask for something formally" "/rɪˈkwest/" "I would like to request a day off." "verb"
add_vocabulary "$LESSON_ID" "favor" "A kind action" "/ˈfeɪvər/" "Could you do me a favor?" "noun"
add_vocabulary "$LESSON_ID" "mind" "To object to something" "/maɪnd/" "Would you mind helping me?" "verb"
add_vocabulary "$LESSON_ID" "possible" "Able to be done" "/ˈpɒsəbl/" "Is it possible to reschedule?" "adjective"
add_vocabulary "$LESSON_ID" "appreciate" "To be grateful for" "/əˈpriːʃieɪt/" "I would appreciate your help." "verb"

add_grammar "$LESSON_ID" "Modal Verbs for Requests" \
    "Use Could/Would/Can you...? for requests. 'Could' and 'Would' are more polite." \
    "Could you send me the file? / Would you mind closing the door? / Can you help me?"

echo ""
echo "✅ Seeding complete!"
echo "📊 Created 4 new lessons with ~20 vocabulary words and grammar rules"
echo ""
echo "Check results:"
echo "curl -H 'Authorization: Bearer $TOKEN' $API_URL/learning/lessons | jq ."
