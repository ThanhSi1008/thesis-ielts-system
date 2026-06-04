-- Extract correct answers from exam questions JSON for listening tests 2, 3, 4
-- This query extracts the question structure to build answer maps

SELECT id, title,
  jsonb_pretty(
    (questions::jsonb -> 'parts' -> 0 -> 'sections' -> 0 -> 'questions' -> 0)
  ) AS sample_question
FROM exams
WHERE id IN (
  'eb1e4a25-dee0-4197-9a37-051063d9fa52',
  'd0277eb2-c1c1-44ac-ba0a-ba71af7bea12',
  'ae6fdf14-6ecd-4469-827f-0ac5d0ac4d48'
)
ORDER BY title;
