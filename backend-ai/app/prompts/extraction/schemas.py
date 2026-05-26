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
                    "multiple_choice, short_answer, form_completion, note_completion, "
                    "sentence_completion, matching, table_completion, true_false_not_given, yes_no_not_given."
    )
    question_text: str = Field(
        description="The question text or prompt. For gap-filling, use underscores to indicate blank slots (e.g., 'The speaker's name is ___.')"
    )
    options: Optional[List[str]] = Field(
        default=None,
        description="List of options (e.g., ['A. Teacher', 'B. Doctor']) if the type is multiple_choice. Otherwise, leave as null."
    )
    answer: str = Field(
        description="The correct answer key. Must NOT be empty. Can be a letter choice (e.g., 'A'), "
                    "a Boolean/Evaluation status (e.g., 'TRUE', 'YES', 'NOT GIVEN'), or plain text answer words for completion."
    )
    explanation: Optional[str] = Field(
        default=None,
        description="Highly detailed, comprehensive explanation written entirely in English. Must NOT be a simple re-statement of the answer. It must clearly state where the answer is located in the text/transcript, justify why it is correct based on logic/synonyms, and briefly analyze why other options are incorrect if multiple choice/matching."
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
    audioUrl: Optional[str] = Field(default=None, description="Set as null. Populated dynamically by pipeline.")
    transcript: List[SpeakerText] = Field(description="Spoken transcript segmented by speakers.")
    content: List[QuestionItem] = Field(description="List of structured question items with inline answers.")
    questionTypes: List[str] = Field(description="Unique list of question types present in this part.")

class ListeningPartSchema(BaseModel):
    title: str = Field(description="Title of this Listening Test (e.g. 'Cambridge IELTS 18 - Listening Test 1').")
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
    prompt: str = Field(description="The complete prompt, task instructions, and question text.")
    imageUrl: Optional[str] = Field(default=None, description="Set as null. Populated dynamically by pipeline.")
    minimumWords: int = Field(default=150, description="Minimum word requirement: 150 for TASK_1, 250 for TASK_2.")
    suggestedTime: int = Field(default=20, description="Suggested time limit in minutes: 20 for TASK_1, 40 for TASK_2.")
    difficulty: str = Field(default="medium", description="Difficulty classification: easy, medium, or hard.")
    engnovateSlug: Optional[str] = Field(default=None, description="Set as null.")

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
    engnovateSlug: Optional[str] = Field(default=None, description="Set as null.")
