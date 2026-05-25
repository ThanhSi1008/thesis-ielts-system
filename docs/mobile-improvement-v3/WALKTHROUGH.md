# WALKTHROUGH — Hướng Dẫn Kỹ Thuật Từng Bước

> Phác thảo code **minh hoạ** (illustrative) cho các thay đổi trọng tâm. Tên hàm/prop/biến bám sát code thật trong repo để dễ áp dụng; không phải bản compile-ready — đọc kèm file gốc.
>
> **Tham chiếu chuẩn (web):** `frontend-web/src/app/ielts/intensive/[examId]/take/[sessionId]/{page,TakeReadingBoard,TakeListeningBoard}.tsx`, `frontend-web/src/components/AnswerField.tsx`, `frontend-web/src/lib/exam-parser.ts`.

---

## §1. Resume full-exam: khôi phục đáp án + thời gian (P1-1)

**Hiện trạng:** `useExamSession.loadExam()` luôn `createSession(...)`; `ExamPlayerScreen` không hydrate `session.answers`; `useExamTimer(duration, …)` luôn bắt đầu từ `duration*60`.

**Web làm gì (chuẩn):** `take/.../page.tsx` —
```ts
if (session?.answers) setAnswers(session.answers as AnswersState);
if (session?.status === "COMPLETED") router.replace(resultUrl);
if (!customTime) setSecondsLeft(res.duration * 60);
```

**Bước 1 — `useExamSession` trả thêm dữ liệu resume:**
```ts
// hooks/useExamSession.ts
return {
  exam, session, loading, submitting, isAiGrading, setIsAiGrading,
  submitSession, refetch: loadExam,
  // mới:
  resumedAnswers: session?.answers ?? null,
  resumedElapsed: session?.timeTaken ?? 0,
  sessionStatus: session?.status ?? null,
};
```

**Bước 2 — `useExamTimer` nhận `initialElapsed`:**
```ts
// hooks/useExamTimer.ts
export function useExamTimer(durationMinutes, running, onExpire, initialElapsed = 0) {
  const initialSeconds = durationMinutes * 60;
  const timer = useTimer(initialSeconds, running, initialElapsed); // useTimer cộng dồn từ initialElapsed
  ...
}
```
> Kiểm `hooks/useTimer.ts` để thêm tham số `initialElapsed` (remaining = total − initialElapsed, elapsed bắt đầu từ initialElapsed).

**Bước 3 — `ExamPlayerScreen` hydrate state khi có session:**
```ts
// app/ielts/intensive/[examId].tsx
useEffect(() => {
  if (!session) return;
  if (session.status === 'COMPLETED' || session.status === 'GRADED') {
    router.replace(ROUTES.ieltsIntensiveResult(session.id) as any);
    return;
  }
  const a = session.answers;
  if (a) {
    if (exam?.type === 'WRITING') setWritingAnswers({ task1: a.task1 ?? '', task2: a.task2 ?? '' });
    else if (exam?.type === 'SPEAKING') setSpeakingAnswers(a);
    else setAnswers(a);
  }
}, [session, exam?.type]);

const { elapsed, display, isWarning } =
  useExamTimer(exam?.duration ?? 60, timerRunning, handleExpire, session?.timeTaken ?? 0);
```
> Lưu ý `useAnswerState` hiện chỉ expose `setAnswer` (set 1 key); cần thêm `setAnswers` (set cả object) để hydrate hàng loạt — đã có `setAnswers` trong hook, chỉ cần destructure ra ở màn này.

**Kiểm thử:** làm dở → Save & Exit → vào lại: đáp án + đồng hồ đúng.

---

## §2. Intensive W/S dùng `GradingContext` toàn cục (P1-2)

**Hiện trạng:** `executeSubmit` gọi `submitSession` (→ `useGradingPoll` cục bộ, chết khi rời màn).

**Web làm gì:** `TakeWritingBoard` dùng `useGrading().submitAndTrack({ … resultUrl })` + đọc `activeJob` để render overlay; rời màn vẫn theo dõi.

**Bước 1 — submit qua context cho W/S:**
```ts
// app/ielts/intensive/[examId].tsx
import { useGrading } from '@/contexts/GradingContext';
const { submitAndTrack, jobs } = useGrading();
const activeJob = jobs.find(j => j.sessionId === session?.id);
const isAiProcessing = !!activeJob && (activeJob.status === 'SUBMITTING' || activeJob.status === 'GRADING');

const executeSubmit = async () => {
  if (!session) return;
  if (player?.playing) player.pause();
  setTimerRunning(false);
  const payload = buildSubmitPayload(exam?.type);

  if (exam?.type === 'WRITING' || exam?.type === 'SPEAKING') {
    await submitAndTrack({
      sessionId: session.id,
      examId,
      examType: 'INTENSIVE', // ⚠️ PHẢI là 'INTENSIVE' — xem cảnh báo bên dưới
      answers: payload,
      timeTaken: elapsed,
      resultUrl: ROUTES.ieltsIntensiveResult(session.id),
    });
    setShowSuccess(true); // overlay AI dựa trên activeJob
  } else {
    const res = await ieltsExamsApi.submitSession(session.id, payload, elapsed); // L/R non-AI
    setPendingResultSessionId(session.id);
    setShowSuccess(true);
  }
};
```

**Bước 2 — overlay đọc từ `activeJob`, "Go back" rời màn nhưng job chạy nền:**
```ts
{isAiProcessing && (
  <AIGradingOverlay
    status={activeJob?.status}
    onGoBack={() => { setExamReady(false); router.replace(ROUTES.ieltsIntensive as any); }}
  />
)}
useEffect(() => {
  if (activeJob?.status === 'DONE') router.replace(activeJob.resultUrl as any);
}, [activeJob?.status]);
```

> **⚠️ Quan trọng — điểm dễ sai nhất của P1-2:** Trong `contexts/GradingContext.tsx`, cả `submitAndTrack` lẫn `startPolling` route theo `examType`:
> - `examType === 'WRITING'` → `ieltsAdvancedApi.submitWritingSession` / `getWritingSession`
> - `examType === 'SPEAKING'` → `ieltsAdvancedApi.submitSpeakingSession` / `getSpeakingSession`
> - **`else` (gồm `'INTENSIVE'`)** → `ieltsExamsApi.submitSession` / `getSession` ✅ — đúng cho intensive.
>
> Vì vậy intensive **phải** truyền `examType: 'INTENSIVE'` (KHÔNG phải `'WRITING'/'SPEAKING'`, vì sẽ gọi nhầm API của advanced). Nhánh `isGraded` của context đã đọc đúng `session.ieltsIntensiveResult.{writingScore,speakingScore}` + `status === 'GRADED'`.
>
> Hệ quả phụ (cosmetic): toast trong context hiển thị "Writing/Speaking" dựa trên `examType === 'SPEAKING' ? 'Speaking' : 'Writing'` → với `'INTENSIVE'` luôn ra "Writing". Nếu cần chuẩn chữ, thêm nhánh nhãn cho `'INTENSIVE'` (ví dụ dựa vào `exam.type` lưu kèm job) — ưu tiên thấp.

**Kiểm thử:** submit W/S intensive → rời màn → nhận toast khi xong → mở result.

---

## §3. Answer-sheet: cuộn đúng câu + answered chuẩn (P1-3)

**Hiện trạng:** `scrollToQuestion(n)` chỉ cuộn tới part (`partOffsetsRef`); `ExamAnswerSheet` tính `answered = !!answers[String(n)]`.

**Bước 1 — đo offset từng câu (thay vì từng part):**
```ts
// trong renderer câu hỏi, bọc mỗi câu:
<View onLayout={(e) => { questionOffsetsRef.current[n] = partTop + e.nativeEvent.layout.y; }}>
  {/* câu n */}
</View>

// scrollToQuestion:
const y = questionOffsetsRef.current[n];
if (y != null) scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
```
> Vì layout câu nằm trong `View` part (có `onLayout` ghi `partOffsetsRef`), cộng `partTop` để ra offset tuyệt đối trong `ScrollView`. Với listening chia tab/part, cần chuyển sang part chứa câu trước khi cuộn (đổi `activeListeningPartIndex`).

**Bước 2 — `answeredSet` đúng cho mọi loại câu (mượn `exam-parser`):**
```ts
import { extractAllItemsFromPart, questionNumbersFromItems } from '@/lib/exam-parser';

const answeredSet = useMemo(() => {
  const s = new Set<number>();
  for (const part of parts) {
    for (const item of extractAllItemsFromPart(part)) {
      for (const n of questionNumbersFromItems([item])) {
        // map key thực của item (có thể là 'mcm-<idx>' hoặc String(n)) → nếu có giá trị thì đánh dấu
        if (isItemAnswered(item, answers)) s.add(n);
      }
    }
  }
  return s;
}, [parts, answers]);
```
```ts
// ExamAnswerSheet nhận answeredSet thay vì tự suy ra:
<ExamAnswerSheet ... answeredSet={answeredSet} flaggedSet={flaggedSet} onToggleFlag={toggleFlag} />
// trong component: const answered = answeredSet.has(n);
```

**Bước 3 — cờ xem lại:**
```ts
const [flagged, setFlagged] = useState<Set<number>>(new Set());
const toggleFlag = (n: number) => setFlagged(prev => {
  const next = new Set(prev); next.has(n) ? next.delete(n) : next.add(n); return next;
});
// ô câu: 3 trạng thái answered / unanswered / flagged + chú thích legend.
```

**Kiểm thử:** đề có multiple_choice_multiple + matching; bấm câu 27 → cuộn đúng; trả lời multi → sáng answered; flag câu → màu cờ + đếm riêng.

---

## §4. Autosave dùng chung (P1-4)

**Hiện trạng:** practice autosave 30s (inline trong `practice/[sessionId].tsx`), advanced 5s (`useWritingAutosave`), full-exam **không có**.

**Đề xuất — một hằng số + một cơ chế:**
```ts
// constants/index.ts
export const EXAM_AUTOSAVE_MS = 12000; // 10–15s

// hook chung (tổng quát hoá useWritingAutosave để nhận payloadFn + saveFn)
function useExamAutosave({ sessionId, getPayload, save, intervalMs = EXAM_AUTOSAVE_MS, enabled }) { ... }

// full-exam writing:
const { isSaving, lastSavedAt } = useExamAutosave({
  sessionId: session?.id ?? null,
  enabled: examType === 'WRITING' && examReady,
  getPayload: () => buildSubmitPayload('WRITING'),
  save: (sid, payload) => ieltsExamsApi.saveProgress(sid, payload, elapsed),
});
```
> Hiển thị "✍️ Đang lưu…/✓ Đã lưu HH:mm" như practice runner. Bắt lỗi im lặng (đừng chặn người dùng), log `__DEV__`.

---

## §5. Listening exam-mode: phát một lần, liên tục, auto-advance (P3-1)

**Web (chuẩn):** một `<audio>` nguồn theo `playingAudioIdx`, `onEnded` → `setPlayingAudioIdx(prev+1)`; `hasStartedAudio` một lần; không có nút tua.

**Mobile — phác thảo:**
```ts
// app/ielts/intensive/[examId].tsx (LISTENING, exam mode)
const [playingPartIdx, setPlayingPartIdx] = useState(0);   // audio đang phát (≠ tab xem câu)
const [hasStarted, setHasStarted] = useState(false);
const audioUrl = listeningParts[playingPartIdx]?.audio_url ?? null;
const player = useAudioPlayer(audioUrl || '');
const status = useAudioPlayerStatus(player); // expo-audio

// auto-advance khi part hiện tại phát xong:
useEffect(() => {
  if (status.didJustFinish && playingPartIdx < listeningParts.length - 1) {
    setPlayingPartIdx(i => i + 1);
  }
}, [status.didJustFinish]);

// tab part chỉ đổi KHUNG CÂU HỎI (activeListeningPartIndex), KHÔNG điều khiển audio trong exam mode
```
```tsx
<ExamAudioPlayer
  mode="exam"
  isPlaying={status.playing}
  position={status.currentTime} duration={status.duration}  // progress, read-only
  label={`Audio đang phát — Part ${playingPartIdx + 1}/${listeningParts.length}`}
  volume={volume} onVolumeChange={setVolume}
/>
```
> Bỏ logic "đổi tab → pause + phát lại part khác" trong exam mode. Practice mode (P3-2) thì cho `RichAudioPlayer` đầy đủ.

---

## §6. Advanced Reading dùng split (tái dùng `ReadingExamBlock`) (P2-1)

**Hiện trạng:** `passagePanel` `maxHeight: 220` + câu hỏi cuộn dưới.

**`ReadingExamBlock` đã có:** part tabs, split dọc resizable (phone, `topFlex` + splitter), 2 cột (tablet, `isTablet = width > 600`), `TextWithLookup`. Nó nhận `{ parts, answers, onChange, renderGroup }`.

**Phác thảo map dữ liệu advanced → ReadingExamBlock:**
```tsx
// app/ielts/advanced/[skill]/[partId].tsx  (nhánh Reading)
const readingParts = [{
  part_number: part.partNumber,
  topic: part.title,
  passage_text: part.passage,          // ReadingExamBlock đọc passage_text || passage
  passageWithLocations: part.passageWithLocations,
  question_groups: part.content,       // hoặc 'content' — ReadingExamBlock đọc question_groups/groups/content
}];

<ReadingExamBlock
  parts={readingParts}
  answers={answers}
  onChange={setAnswer}
  renderGroup={renderGroup}            // tạm dùng renderGroup advanced; thống nhất ở P4
/>
```
> Cần truyền/khôi phục `locatedQuestion` để giữ tính năng locate trong passage. Nếu `ReadingExamBlock` chưa nhận `locatedQuestion`, thêm prop optional và forward xuống `PassageReview`. Reading không có audio nên bỏ qua phần audio của block.

**Kiểm thử:** phone kéo splitter chia đoạn/câu; tablet 2 cột; locate vẫn chạy.

---

## §7. Mẹo migrate an toàn

- **Mỗi task = 1 PR nhỏ**; giữ flow cũ chạy tới khi flow mới pass (đặc biệt P4).
- **Regression L/R:** chụp đáp án/điểm của vài session trước thay đổi, so sau thay đổi — đáp án chấm **không được đổi**.
- **Đừng hardcode màu**: mọi surface mới đọc `colors` từ `useTheme()`; validate light+dark trong `app/_dev/atom-gallery.tsx`.
- **Memo block câu hỏi** trước khi nối autosave/timer để tránh re-render giật (P5-4).
- **Push notification** là phao cứu sinh cho grading khi user rời app — nhưng không thay thế `GradingContext` (P1-2); cả hai bổ trợ nhau.

---

## Phụ lục — Bản đồ file nhanh

| Vai trò | Mobile | Web (đối chiếu) |
|---|---|---|
| Full-exam runner | `app/ielts/intensive/[examId].tsx` | `…/take/[sessionId]/page.tsx` + 4 board |
| Practice runner (per-part) | `app/ielts/intensive/practice/[sessionId].tsx` | `…/practice/[sessionId]/` boards |
| Advanced L/R runner | `app/ielts/advanced/[skill]/[partId].tsx` | `advanced/{listening,reading}/[partId]/page.tsx` |
| Reading split layout | `components/ielts/ReadingExamBlock.tsx` | `ReadingPassagePanel` + `ReadingQuestionsPanel` |
| Render câu hỏi | `components/intensive/QuestionGroupRenderer.tsx` (A) · advanced inline (B) · `ielts/exercise/*` (C) | `components/AnswerField.tsx` (1 hệ) |
| Answer palette | `components/intensive/ExamAnswerSheet.tsx` | palette trong Take boards |
| Audio | `components/intensive/ExamAudioPlayer.tsx` · `components/ielts/RichAudioPlayer.tsx` | `<audio>` trong Take/advanced |
| Grading bền | `contexts/GradingContext.tsx` (+`hooks/useGradingPoll.ts`) | `contexts/GradingContext` |
| Timer / answers / exit / autosave | `hooks/{useExamTimer,useAnswerState,useExitConfirm,useWritingAutosave,useExamSession}.ts` | logic trong page/boards |
| Parser số câu | `lib/exam-parser.ts` | `lib/exam-parser.ts` |
| Chuẩn bị trước thi | `components/intensive/PreparationScreen.tsx` | trang `start/` |
