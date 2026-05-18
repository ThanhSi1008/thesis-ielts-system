# Migration Squash Backup — 2026-05-18

## Production Supabase State

**Project:** wudbfombygjkljimmgsc (thesis, ap-southeast-1)

### CRITICAL: _prisma_migrations table
**DOES NOT EXIST** on production. Schema was managed outside Prisma migration system.

### Production Tables (67 total, public schema)

| Table | Rows |
|-------|------|
| users | 10 |
| exams | 15 |
| exam_sessions | 6 |
| results | 2 |
| learning_materials | 0 |
| learning_progress | 0 |
| lessons | 0 |
| vocabularies | 0 |
| grammars | 0 |
| pronunciation_attempts | 1 |
| vocabulary_books | 6 |
| vocabulary_units | 180 |
| vocabulary_words | 3600 |
| vocabulary_exercises | 2005 |
| vocabulary_questions | 840 |
| vocabulary_progress | 2 |
| grammar_books | 3 |
| grammar_units | 158 |
| grammar_exercises | 566 |
| pronunciation_sounds | 44 |
| decks | 13 |
| flashcards | 20 |
| flashcard_reviews | 25 |
| card_types | 8 |
| card_type_fields | 30 |
| card_templates | 8 |
| question_notes | 0 |
| shadowing_videos | 2 |
| shadowing_folders | 0 |
| ielts_skills | 4 |
| ielts_lessons | 38 |
| ielts_listening_exercises | 28 |
| ielts_reading_exercises | 42 |
| ielts_basic_progress | 102 |
| ielts_writing_exercises | 37 |
| ielts_writing_user_answers | 0 |
| ielts_practice_listening_parts | 4 |
| ielts_practice_sessions | 1 |
| ielts_practice_reading_parts | 3 |
| ielts_practice_reading_sessions | 0 |
| ielts_profiles | 8 |
| student_teacher_links | 0 |
| notifications | 24 |
| sound_example_words | 220 |
| pronunciation_progress | 1 |
| grammar_progress | 1 |
| ielts_advanced_speaking_parts | 321 |
| ielts_advanced_speaking_sessions | 0 |
| shared_decks | 0 |
| shadowing_progress | 1 |
| dictation_videos | 2 |
| dictation_folders | 0 |
| dictation_progress | 1 |
| ielts_speaking_exercises | 18 |
| ielts_advanced_writing_prompts | 88 |
| ielts_advanced_writing_sessions | 0 |
| achievements | 40 |
| user_achievements | 9 |
| xp_logs | 56 |
| posts | 1 |
| comments | 0 |
| post_likes | 0 |
| post_bookmarks | 0 |
| subscriptions | 9 |
| payments | 9 |
| usage_records | 0 |
| pricing_plans | 4 |

## Local Migration Folders (25 total)

1. 20260130160829_init
2. 20260131043515_add_learning_content
3. 20260131110111_add_vocabulary_progress
4. 20260314144659_sync_schema
5. 20260314191122_add_vocab_lab
6. 20260322203229_add_shadowing_dictation
7. 20260322211626_remove_fk_constraint
8. 20260326010856_float_writing_score
9. 20260330053916_add_note_types
10. 20260331002021_add_card_template_styles
11. 20260331005143_add_note_type_field_type
12. 20260331011208_add_flashcard_style_overrides
13. 20260404074503_rename_note_types_to_card_types
14. 20260411091937_add_ielts_tables
15. 20260414160016_add_ielts_writing_exercise  ← DUPLICATE ielts_skills CREATE
16. 20260414225037_add_ielts_writing_user_answers
17. 20260426102528_initial_clean_state         ← FULL BASELINE (856 lines), re-creates everything
18. 20260427094247_                            ← EMPTY NAME (creates notifications table)
19. 20260427153028_update_shadowing_model
20. 20260429073909_add_pronunciation_enrichment
21. 20260429122227_add_grammar_progress
22. 20260502131135_add_shadowing_indexes
23. 20260507212828_add_ielts_advanced_speaking ← DUPLICATE NAME (28s apart)
24. 20260507212856_add_ielts_advanced_speaking ← DUPLICATE NAME (28s apart)
25. 20260509000000_add_missing_tables          ← LARGE (496 lines)
