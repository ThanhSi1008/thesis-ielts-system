from pydantic import BaseModel, Field
from typing import List, Optional

# =====================================================================
# COMMON SCHEMAS
# =====================================================================

class QuestionItem(BaseModel):
    question_number: int = Field(
        description="The unique IELTS question number (e.g. 1, 2, 3)."
    )
    type: str = Field(
        description="The specific type of the question. MUST be chosen from the whitelist: "
                    "multiple_choice, multiple_choice_multiple, short_answer, fill_blank, "
                    "form_completion, note_completion, sentence_completion, summary_completion, table_completion, "
                    "matching, matching_features, matching_information, matching_headings, "
                    "true_false_not_given, yes_no_not_given, "
                    "map_labeling (LISTENING ONLY — questions are answered against a map / building plan / "
                    "area layout printed on the page), "
                    "diagram_completion (READING ONLY — questions label a technical drawing, a biological / "
                    "scientific process diagram, or a mechanical chart printed within the passage)."
    )
    question_text: str = Field(
        description="The question text or prompt. For gap-filling, use underscores to indicate blank slots (e.g., 'The speaker's name is ___.')"
    )
    options: Optional[List[str]] = Field(
        description=(
            "List of selectable answer choices. REQUIRED (non-null) for selection-based types: "
            "multiple_choice and multiple_choice_multiple (e.g. ['A. increased efficiency', 'B. reduced costs', 'C. greater accuracy']); "
            "matching / matching_features / matching_information — complete choice bank (e.g. ['A. a TSI Cut', 'B. a Salvage Cut']); "
            "matching_headings — all headings with Roman numeral prefix (e.g. ['i. The role of technology', 'ii. A new approach']). "
            "SPECIAL CASE — summary_completion / note_completion / sentence_completion WITH A PROVIDED WORD/PHRASE BANK "
            "(instruction says 'Complete the summary using the list of phrases, A-F, below' / 'Write the correct letter, A-F'): "
            "in this variant `options` is REQUIRED (non-null) — populate it with the COMPLETE labelled bank EXACTLY as printed "
            "(e.g. ['A. medical practitioners', 'B. specialised tasks', 'C. available resources', 'D. reduced illness', "
            "'E. professional authority', 'F. technology experts']), and the same full bank MUST be repeated on EVERY item of "
            "that question set. "
            "MUST be null for the from-passage gap-fill variant of these completion types ('Choose ONE WORD ONLY from the passage', "
            "no labelled bank) and ALWAYS for: form_completion, table_completion, fill_blank, short_answer, "
            "true_false_not_given, yes_no_not_given."
        )
    )
    answer: str = Field(
        description="The correct answer key. Must NOT be empty. Can be a letter choice (e.g., 'A') — including "
                    "summary/note/sentence completion that uses a provided A-F phrase bank, where the answer is the LETTER, not the phrase; "
                    "a Boolean/Evaluation status (e.g., 'TRUE', 'YES', 'NOT GIVEN'); "
                    "or the plain text word(s) for from-passage completion (no bank)."
    )
    explanation: Optional[str] = Field(
        description=(
            "Highly detailed, comprehensive explanation written entirely in English using this STRICT literal prefix format:\n"
            "Locating: [state the exact speaker turn / paragraph / section label where the answer evidence appears, with a short verbatim quote]\n"
            "Justification: [explain why the answer is correct via synonym mapping, paraphrase analysis, or logical deduction]\n"
            "Distractor Analysis: [for multiple_choice, multiple_choice_multiple, matching, matching_features, matching_information, matching_headings — briefly explain why each wrong option is incorrect or misleading]\n"
            "Must NOT be a simple re-statement of the answer."
        )
    )
    image_url: Optional[str] = Field(
        default=None,
        description=(
            "Visual-asset pointer for question groups that depend on an image the test-taker must read. "
            "POPULATE this field ONLY when you have visually DETECTED such an asset on the page using your "
            "multimodal capabilities:\n"
            "  • LISTENING — a map, building plan, or area layout (type `map_labeling`).\n"
            "  • READING — a technical drawing, biological/scientific process diagram, or mechanical chart "
            "(type `diagram_completion`).\n"
            "When detected, set this to the EXACT literal string \"PENDING_ADMIN_UPLOAD\" on EVERY question item "
            "that belongs to that visual group (the same placeholder repeated across the whole group, mirroring "
            "how a shared `options` bank is repeated). An admin crops the image from the source PDF during review "
            "and overwrites this placeholder with the real secure image URL. "
            "NEVER fabricate or guess a real URL. "
            "For every other question type — and whenever NO map/plan/diagram is present — OMIT this field or set "
            "it to null, so no uploader is rendered during review."
        ),
    )

# =====================================================================
# LISTENING SCHEMA
# =====================================================================

class SpeakerText(BaseModel):
    speaker: str = Field(description="Name or label of the speaker (e.g. 'Man', 'Woman', 'John').")
    text: str = Field(description="Verbatim spoken words of this speaker segment.")

class ListeningSectionSchema(BaseModel):
    partNumber: int = Field(description="The Part number, integer from 1 to 4.")
    title: str = Field(description="Title of this specific Listening part (e.g. 'Part 1: Travel Inquiry').")
    audioUrl: Optional[str] = Field(
        description=(
            "Cloud storage URL of this part's audio file. "
            "When an AVAILABLE MEDIA ASSETS block is provided in the prompt, you MUST copy the exact "
            "storedUrl of the matching audio asset here (matched by Part number). Do NOT leave null if a URL is supplied."
        )
    )
    transcript: List[SpeakerText] = Field(description="Spoken transcript segmented by speakers.")
    content: List[QuestionItem] = Field(description="List of structured question items with inline answers.")
    questionTypes: List[str] = Field(description="Unique list of question types present in this part.")

class ListeningPartSchema(BaseModel):
    title: str = Field(description="Title of this Listening Test (e.g. 'Cambridge IELTS 18 - Listening Test 1').")
    imageUrl: Optional[str] = Field(
        description=(
            "Cloud storage URL of the official answer key image. "
            "When an AVAILABLE MEDIA ASSETS block is provided in the prompt, you MUST copy the exact "
            "storedUrl of the image asset here. Do NOT leave null if a URL is supplied."
        )
    )
    parts: List[ListeningSectionSchema] = Field(description="List of all 4 listening parts in this test.")

# =====================================================================
# READING SCHEMA
# =====================================================================

class ReadingPassageSchema(BaseModel):
    partNumber: int = Field(description="The Passage number, integer from 1 to 3.")
    title: str = Field(description="Title of this specific Reading passage (e.g. 'Passage 1: London Underground').")
    passage: str = Field(description="The complete visible text of the reading passage. Do NOT truncate or abbreviate.")
    content: List[QuestionItem] = Field(description="List of structured question items with inline answers.")
    questionTypes: List[str] = Field(description="Unique list of question types present in this passage.")

class ReadingPartSchema(BaseModel):
    title: str = Field(description="Title of this Reading Test (e.g. 'Cambridge IELTS 18 - Reading Test 1').")
    parts: List[ReadingPassageSchema] = Field(description="List of all 3 reading passages in this test.")

# =====================================================================
# WRITING SCHEMA
# =====================================================================

class WritingPromptSchema(BaseModel):
    taskType: str = Field(description="Strictly either 'TASK_1' or 'TASK_2'.")
    subType: str = Field(
        description="The IELTS Writing essay/task sub-type (e.g. line_graph, bar_chart, pie_chart, table, diagram, map, "
                    "opinion, discussion, double_question, advantages_disadvantages)."
    )
    title: str = Field(description="Title describing this writing task.")
    prompt: str = Field(
        description=(
            "The complete prompt in Markdown. "
            "Bold (**…**): timing instruction line and core action instruction line. "
            "Italic (*…*): the quoted opinion/statement box in TASK_2. "
            "Separate every logical block with a SINGLE newline (\\n) — no blank lines (\\n\\n): "
            "timing → description → action instruction → supporting note → word-count reminder. "
            "All text must be verbatim from the source document."
        )
    )
    imageUrl: Optional[str] = Field(description="Set as null. Populated dynamically by pipeline.")
    minimumWords: int = Field(description="Minimum word requirement: 150 for TASK_1, 250 for TASK_2.")
    suggestedTime: int = Field(description="Suggested time limit in minutes: 20 for TASK_1, 40 for TASK_2.")
    difficulty: str = Field(description="Difficulty classification: easy, medium, or hard.")
    engnovateSlug: Optional[str] = Field(description="Set as null.")

class WritingExamSchema(BaseModel):
    title: str = Field(description="Title of the Writing test (e.g. 'Cambridge IELTS 18 - Writing Test 1').")
    tasks: List[WritingPromptSchema] = Field(
        description="Array of writing tasks. Must contain exactly TASK_1 and TASK_2 in that order."
    )

# =====================================================================
# SPEAKING SCHEMA
# =====================================================================

class SpeakingQuestion(BaseModel):
    text: str = Field(description="The examiner's spoken question text.")

class SpeakingPartSchema(BaseModel):
    partNumber: int = Field(description="Speaking Part number, integer from 1 to 3.")
    partType: str = Field(description="Type of speaking part: 'interview' (Part 1), 'cue_card' (Part 2), or 'discussion' (Part 3).")
    topic: str = Field(description="The general topic or subject of this speaking section (e.g. 'Hometown', 'A book you read').")
    title: str = Field(description="Descriptive title of this speaking section.")
    questions: List[SpeakingQuestion] = Field(description="The list of examiner questions. For Part 2 cue_card, provide 1 item representing the cue card text prompt.")
    engnovateSlug: Optional[str] = Field(description="Set as null.")

# =====================================================================
# INTENSIVE SPEAKING SCHEMA (full 3-part mock exam)
# Used only when targetSystem == INTENSIVE. Gemini extracts the TEXT content
# of all 3 parts in one shot; the pipeline (speaking_tts_service) then
# synthesises the examiner audio and rewrites the audio URL fields. The
# Gemini layer therefore returns NO audio/video URLs — those start empty.
# =====================================================================

class IntensiveSpeakingQuestionText(BaseModel):
    text: str = Field(
        description="The exact examiner question text, copied verbatim from the source (e.g. 'What kinds of bills do you have to pay?')."
    )

class IntensiveSpeakingPartSchema(BaseModel):
    part_number: int = Field(description="Speaking part number: exactly 1, 2, or 3.")
    topic: str = Field(
        description="The headline topic/theme of this part as printed in the source (e.g. 'Paying bills', 'Young people and cooking')."
    )
    questions: Optional[List[IntensiveSpeakingQuestionText]] = Field(
        default=None,
        description=(
            "The list of examiner questions. REQUIRED (non-null) for Part 1 and Part 3 — one entry per question, "
            "verbatim. For Part 3 that spans multiple discussion sub-topics, flatten every example question across "
            "all sub-topics into this single list. MUST be null for Part 2."
        ),
    )
    cue_card: Optional[str] = Field(
        default=None,
        description=(
            "REQUIRED (non-null) for Part 2 ONLY. The COMPLETE cue-card prompt as a single string with literal "
            "newline characters (\\n) separating each line. Preserve the structure exactly: the main task line "
            "('Describe ...'), then 'You should say:' followed by each bullet on its own line, then the final "
            "'and explain ...' line. MUST be null for Part 1 and Part 3."
        ),
    )

class IntensiveSpeakingExamSchema(BaseModel):
    parts: List[IntensiveSpeakingPartSchema] = Field(
        description="EXACTLY 3 parts, ordered Part 1, Part 2, Part 3."
    )
