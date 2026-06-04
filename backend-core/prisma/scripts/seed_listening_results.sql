-- Insert COMPLETED sessions and results for Listening Tests 2, 3, 4
-- for user Sambucha Pham (61e1a283-318e-4d02-9b56-a80c8fa14069)
-- Each test at a different band tier:
-- Test 1: already has score=4 → Band 2.5  (existing)
-- Test 2: score=18 → Band 5.5
-- Test 3: score=30 → Band 7.0
-- Test 4: score=37 → Band 8.5

-- ========== Listening Test 2 (Band 5.5 = 18 correct) ==========
INSERT INTO exam_sessions (id, "userId", "examId", status, answers, "timeTaken", "startedAt", "submittedAt", "createdAt", "updatedAt")
VALUES (
  'a0000001-demo-4000-8000-000000000002',
  '61e1a283-318e-4d02-9b56-a80c8fa14069',
  'eb1e4a25-dee0-4197-9a37-051063d9fa52',
  'COMPLETED',
  '{}',
  1920,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '32 minutes',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

INSERT INTO results (id, "userId", "sessionId", "totalScore", "listeningScore", "gradedAt", "createdAt", "updatedAt")
VALUES (
  'b0000001-demo-4000-8000-000000000002',
  '61e1a283-318e-4d02-9b56-a80c8fa14069',
  'a0000001-demo-4000-8000-000000000002',
  18,
  18,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- ========== Listening Test 3 (Band 7.0 = 30 correct) ==========
INSERT INTO exam_sessions (id, "userId", "examId", status, answers, "timeTaken", "startedAt", "submittedAt", "createdAt", "updatedAt")
VALUES (
  'a0000001-demo-4000-8000-000000000003',
  '61e1a283-318e-4d02-9b56-a80c8fa14069',
  'd0277eb2-c1c1-44ac-ba0a-ba71af7bea12',
  'COMPLETED',
  '{}',
  2100,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days' + INTERVAL '35 minutes',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

INSERT INTO results (id, "userId", "sessionId", "totalScore", "listeningScore", "gradedAt", "createdAt", "updatedAt")
VALUES (
  'b0000001-demo-4000-8000-000000000003',
  '61e1a283-318e-4d02-9b56-a80c8fa14069',
  'a0000001-demo-4000-8000-000000000003',
  30,
  30,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- ========== Listening Test 4 (Band 8.5 = 37 correct) ==========
INSERT INTO exam_sessions (id, "userId", "examId", status, answers, "timeTaken", "startedAt", "submittedAt", "createdAt", "updatedAt")
VALUES (
  'a0000001-demo-4000-8000-000000000004',
  '61e1a283-318e-4d02-9b56-a80c8fa14069',
  'ae6fdf14-6ecd-4469-827f-0ac5d0ac4d48',
  'COMPLETED',
  '{}',
  2280,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '38 minutes',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

INSERT INTO results (id, "userId", "sessionId", "totalScore", "listeningScore", "gradedAt", "createdAt", "updatedAt")
VALUES (
  'b0000001-demo-4000-8000-000000000004',
  '61e1a283-318e-4d02-9b56-a80c8fa14069',
  'a0000001-demo-4000-8000-000000000004',
  37,
  37,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);
