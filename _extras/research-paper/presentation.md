# IELTS Master English AI - Presentation Script & Slides

This document contains **ultra-short Slide Text** (for the screen) and **concise, natural-sounding Speaker Notes** (what you literally say out loud). 

The speaker notes are written in short, conversational sentences so you can speak them smoothly without sounding like a robot.

---

## Slide 1: The Challenge in IELTS Preparation

**[Slide Text]**
* **Demand:** 3.5M+ IELTS tests annually.
* **Bottleneck:** Writing & Speaking are hard to automate.
* **Reality:** Relies heavily on expensive human examiners.

**[Speaker Notes - English]**
"Good morning. Today we are presenting 'IELTS Master English AI'. 
With over 3.5 million tests a year, the demand for IELTS prep is huge. 
But there is a major bottleneck: while reading and listening are easy to auto-grade, writing and speaking are very difficult. 
Historically, this has required expensive human examiners."

**[Speaker Notes - Vietnamese]**
"Kính thưa hội đồng. Hôm nay nhóm xin trình bày về dự án 'IELTS Master English AI'.
Với hơn 3,5 triệu lượt thi mỗi năm, nhu cầu luyện thi IELTS là rất lớn.
Tuy nhiên, có một bài toán khó. Chấm Nghe - Đọc thì dễ, nhưng chấm Viết và Nói thì rất khó tự động hóa.
Từ trước đến nay, việc này hầu như phải dựa 100% vào giám khảo thật, cực kỳ tốn kém."

---

## Slide 2: Limitations of Current Platforms

**[Slide Text]**
* **Gap 1: Unvalidated AI grading.**
* **Gap 2: Text-only speech processing.**
* **Gap 3: Outdated vocabulary algorithms.**

**[Speaker Notes - English]**
"When surveying current platforms, we found three major gaps.
First, many apps use AI, but they don't mathematically prove their scores match human examiners.
Second, pronunciation scoring relies on expensive cloud APIs like Google or Azure, and these systems only convert speech to text before grading — completely losing the speaker's intonation and rhythm.
Third, no platform integrates modern spaced repetition algorithms like FSRS."

**[Speaker Notes - Vietnamese]**
"Khi khảo sát thị trường, tụi em thấy 3 lỗ hổng lớn.
Thứ nhất, nhiều app có AI chấm điểm nhưng lại không chứng minh được điểm đó có khớp với giám khảo thật hay không.
Thứ hai, việc chấm phát âm phải dùng Cloud API của Google hoặc Azure rất tốn kém, và các app chỉ dịch giọng nói ra chữ rồi mới chấm — làm mất đi phần ngữ điệu và nhịp điệu.
Thứ ba, chưa có nền tảng nào áp dụng thuật toán học từ vựng tiên tiến nhất hiện nay là FSRS."

---

## Slide 3: IELTS Master English AI (The Solution)

**[Slide Text]**
* **Architecture:** Hybrid NestJS + FastAPI.
* **Grading:** Gemini 2.5 Flash.
* **Speech:** Faster-Whisper (Multimodal AI).
* **Vocabulary:** FSRS Algorithm.

**[Speaker Notes - English]**
"To solve this, we built a hybrid system using NestJS and FastAPI so the AI doesn't slow down the app.
For grading, we use Gemini 2.5 Flash to evaluate all four IELTS criteria.
For speech, we process the raw audio locally. The AI literally 'listens' to the audio rather than just reading text.
Finally, we integrated the FSRS algorithm to optimize vocabulary scheduling."

**[Speaker Notes - Vietnamese]**
"Để giải quyết, nhóm xây dựng hệ thống với kiến trúc lai NestJS và FastAPI để app không bị lag.
Về chấm điểm, nhóm dùng Gemini 2.5 Flash để chấm chuẩn 4 tiêu chí.
Về giọng nói, nhóm tự chạy AI local. AI sẽ 'nghe' trực tiếp âm thanh để chấm, chứ không chỉ đọc chữ.
Cuối cùng, tụi em tích hợp thuật toán FSRS để tự động lên lịch học từ vựng tối ưu nhất."

---

## Slide 4: Preliminary Validation

**[Slide Text]**
* **Validation:** 30 human-scored IELTS essays.
* **Result:** **0.97 Pearson correlation**.

**[Speaker Notes - English]**
"Before we look at the architecture, I want to share our validation results.
We had our AI grade 30 essays that were already scored by human examiners.
We achieved a 0.97 Pearson correlation, which proves our system is highly accurate."

**[Speaker Notes - Vietnamese]**
"Trước khi xem phần kỹ thuật, em xin báo cáo nhanh kết quả kiểm thử.
Hệ thống AI đã chấm thử 30 bài luận có điểm thật của giám khảo, và đạt hệ số tương quan lên tới 0.97.
Điều này chứng minh AI của nhóm chấm cực kỳ chính xác và sát với giám khảo thật."

---

## Slide 5: Evolution of Automated Assessment

**[Slide Text]**
* **Past:** Feature matching -> Neural Networks.
* **Present:** LLMs match human reliability with rubrics.
* **The Missing Link:** Validating specifically for IELTS criteria.

**[Speaker Notes - English]**
"Moving to the theory: Automated scoring has evolved to the point where LLMs can grade as well as humans.
However, the missing link in current research is proving this accuracy specifically for the four IELTS criteria.
That validation is exactly what our project achieves."

**[Speaker Notes - Vietnamese]**
"Chuyển sang phần lý thuyết. Các mô hình ngôn ngữ lớn hiện nay chấm bài rất tốt nếu có rubric chuẩn.
Tuy nhiên, lỗ hổng của các nghiên cứu hiện tại là chưa ai thực sự kiểm chứng việc LLM chấm theo đúng 4 tiêu chí IELTS.
Đó chính là nhiệm vụ mà dự án này thực hiện."

---

## Slide 6: Revolutionizing Speaking Assessment

**[Slide Text]**
* **Traditional:** Phoneme scoring via costly Cloud APIs.
* **Multimodal AI:** Evaluates raw audio directly.
* **Benefit:** Captures intonation, stress, hesitation.

**[Speaker Notes - English]**
"For speaking, older apps score individual sounds and use expensive Cloud services.
Our approach is multimodal: we send the raw audio straight to the AI.
This allows the system to hear intonation, stress, and hesitation—things a text transcript misses completely."

**[Speaker Notes - Vietnamese]**
"Với phần Nói, cách làm cũ là chấm từng âm vị, rất tốn kém tiền server Cloud.
Cách mới của tụi em là đa phương thức: Đưa thẳng file audio cho AI phân tích.
Lợi ích là AI sẽ nghe được cả ngữ điệu, trọng âm và sự ngập ngừng, điều mà đọc văn bản không làm được."

---

## Slide 7: Why FSRS over SM-2?

**[Slide Text]**
* **SM-2 Flaw (Anki):** Fixed formulas, intervals > 200 years.
* **FSRS Solution:** Trained on 700M logs. Adaptive & bounded.

**[Speaker Notes - English]**
"For vocabulary, the old SM-2 algorithm has a flaw where review intervals can sometimes push past 200 years.
We use FSRS, which is trained on 700 million review logs.
It is much more adaptive to the individual student and keeps timeframes realistic."

**[Speaker Notes - Vietnamese]**
"Với phần từ vựng, thuật toán SM-2 cũ có một lỗi là hay đẩy lịch ôn tập lên quá xa, có khi tới... 200 năm.
Giải pháp của nhóm là dùng thuật toán FSRS mới nhất.
Nó được huấn luyện trên 700 triệu dữ liệu học, giúp lên lịch ôn tập cực kỳ linh hoạt và hợp lý cho từng người."

---

## Slide 8: Competitive Comparison

**[Slide Text]**
* **Duolingo/Magoosh:** Gamified, no validated AI exams.
* **ELSA Speak:** Phoneme checks, no full mock tests.
* **IELTS Master English AI:** Validated grading, Local STT, FSRS.

**[Speaker Notes - English]**
"Finally, when compared to giants like Duolingo or ELSA, they excel in gamification but lack full AI mock tests.
Our project fills this gap.
We provide validated grading, free local speech processing, and IELTS-specific vocabulary scheduling."

**[Speaker Notes - Vietnamese]**
"So với các nền tảng lớn như Duolingo hay ELSA, họ làm game rất hay nhưng thiếu bài thi thử AI đáng tin cậy.
Dự án của nhóm lấp đầy khoảng trống này.
Hệ thống cung cấp phần chấm điểm chuẩn xác, tự xử lý giọng nói miễn phí, và ôn từ vựng FSRS chuyên cho IELTS."

---

## Slide 9: System Architecture Overview

**[Slide Text]**
* **Client Layer:** Next.js 14 & React Native.
* **Application Layer:** NestJS Monolith + FastAPI Microservice.
* **Data Layer:** PostgreSQL, Redis, MinIO.
* **Integration:** RabbitMQ for asynchronous AI tasks.

**[Speaker Notes - English]**
"Moving on to our system design, we use a three-layer event-driven hybrid architecture.
We separated the core business logic in NestJS from the AI inference in FastAPI.
Since AI tasks can take up to 25 seconds, we use RabbitMQ to handle them asynchronously.
This ensures the main application never freezes while users wait for their grades."

**[Speaker Notes - Vietnamese]**
"Về thiết kế hệ thống, nhóm sử dụng kiến trúc lai theo hướng sự kiện (event-driven) với 3 tầng.
Tụi em tách biệt phần logic chính (NestJS) và phần AI (FastAPI).
Vì các tác vụ AI có thể mất tới 25 giây, nhóm dùng RabbitMQ để xử lý bất đồng bộ.
Điều này giúp app luôn mượt mà và không bao giờ bị đơ trong lúc chờ chấm điểm."

---

## Slide 10: Writing Assessment Pipeline

**[Slide Text]**
* **Grader:** Gemini 2.5 Flash (Structured JSON output).
* **Criteria:** TA, CC, LR, GRA mapped to official rubrics.
* **Calculation:** Server-side band score recalculation.

**[Speaker Notes - English]**
"For the Writing module, we engineered our prompts to output structured JSON format.
The LLM evaluates the four official IELTS criteria and gives strengths, weaknesses, and specific corrections.
To guarantee mathematical accuracy, the final band score is recalculated on our server rather than trusting the LLM's math."

**[Speaker Notes - Vietnamese]**
"Với phần Viết, nhóm thiết kế prompt để AI trả về chuẩn JSON.
AI sẽ chấm theo 4 tiêu chí chuẩn IELTS, đồng thời chỉ ra điểm mạnh, điểm yếu và sửa lỗi sai chi tiết.
Để đảm bảo tính chính xác tuyệt đối, điểm tổng được server tự tính toán lại, thay vì tin tưởng hoàn toàn vào khả năng làm toán của AI."

---

## Slide 11: Multimodal Speaking Pipeline

**[Slide Text]**
* **Stage 1 & 2:** Audio decoding & Local transcription (Faster-Whisper).
* **Stage 3:** Multimodal prompt (Raw audio + Confidence-annotated transcript).
* **Stage 4:** LLM Evaluation (Suprasegmental feature analysis).

**[Speaker Notes - English]**
"Our speaking pipeline is completely multimodal.
First, Faster-Whisper transcribes the audio locally and flags low-confidence words.
Then, we send both the raw audio bytes and the transcript to Gemini.
This allows the AI to evaluate suprasegmental features like rhythm and stress, which text alone cannot capture."

**[Speaker Notes - Vietnamese]**
"Quy trình chấm Nói của dự án hoàn toàn là đa phương thức.
Đầu tiên, Faster-Whisper chuyển giọng nói thành chữ và đánh dấu các từ đọc chưa rõ.
Sau đó, nhóm gửi cả file âm thanh gốc lẫn văn bản cho Gemini.
Nhờ vậy, AI có thể đánh giá được các yếu tố như nhịp điệu và trọng âm, những thứ mà nếu chỉ có văn bản sẽ không thể thấy được."

---

## Slide 12: Multi-Metric Pronunciation Scoring

**[Slide Text]**
* **Metric 1 (40%):** IPA Phoneme Similarity (Articulatory class weighting).
* **Metric 2 (40%):** Whisper STT Confidence.
* **Metric 3 (20%):** Levenshtein Text Distance.
* **Benefit:** Real-time feedback (<100ms) without LLM latency.

**[Speaker Notes - English]**
"For pronunciation practice, we built a dedicated, real-time scoring engine that doesn't rely on the LLM.
It combines IPA phoneme similarity, Whisper confidence, and text distance.
By penalizing substitutions based on articulatory classes—like treating two fricatives as similar—it acts much like a human ear, delivering results in under 100 milliseconds."

**[Speaker Notes - Vietnamese]**
"Riêng với phần luyện phát âm, nhóm xây dựng một bộ chấm điểm thời gian thực mà không cần gọi LLM.
Nó kết hợp độ tương đồng âm vị IPA, độ tự tin của Whisper và khoảng cách văn bản.
Bằng cách phạt lỗi dựa trên nhóm âm (ví dụ hai âm xát thay thế cho nhau sẽ bị trừ ít điểm hơn), hệ thống hoạt động rất giống tai người và trả kết quả chỉ trong chưa tới 100 mili-giây."

---

## Slide 13: FSRS Vocabulary Implementation

**[Slide Text]**
* **Library:** `ts-fsrs` (TypeScript).
* **Card States:** NEW $\rightarrow$ LEARNING $\rightarrow$ REVIEW $\leftrightarrow$ RELEARNING.
* **Parameters:** 90% Target Retention, 365-day Maximum Interval.
* **Mechanism:** Adapts stability and difficulty based on user ratings.

**[Speaker Notes - English]**
"For the vocabulary system implementation, we integrated the FSRS algorithm using the ts-fsrs library.
Every flashcard moves through a four-state machine based on the user's review ratings.
We deliberately configured the system with a 90 percent target retention and a strict 365-day maximum interval.
This bounded interval prevents the pathological scheduling bugs found in older algorithms."

**[Speaker Notes - Vietnamese]**
"Về phần cài đặt từ vựng, nhóm tích hợp thuật toán FSRS thông qua thư viện ts-fsrs.
Mỗi thẻ từ sẽ di chuyển qua 4 trạng thái học dựa trên đánh giá của người dùng.
Tụi em chủ đích cấu hình mục tiêu nhớ bài ở mức 90% và giới hạn khoảng cách ôn tập tối đa là 365 ngày.
Việc giới hạn này giúp ngăn chặn các lỗi lên lịch ôn tập xa tới mức phi thực tế thường gặp ở các thuật toán cũ."

---

## Slide 14: Writing Grading Evaluation

**[Slide Text]**
* **Dataset:** 30 Human-scored essays (Low, Mid, High).
* **Reliability:** 0.96 Quadratic Cohen's Kappa.
* **Accuracy:** 96.7% within $\pm$0.5 band of human score.
* **Finding:** LLM matches human examiner variance.

**[Speaker Notes - English]**
"Moving to our full evaluation, starting with writing.
We tested the AI against 30 human-scored essays across all proficiency levels.
Not only did we get a 0.97 correlation, but 96.7 percent of the AI's scores were within half a band of the human examiners.
This proves the AI matches standard human grading variance."

**[Speaker Notes - Vietnamese]**
"Chuyển sang phần kiểm thử chi tiết. Với phần Viết, nhóm đã test trên 30 bài luận ở mọi trình độ.
Không chỉ đạt độ tương quan 0.97, mà 96.7% số bài chấm lệch không quá nửa điểm (0.5 band) so với giám khảo thật.
Điều này chứng tỏ AI chấm ổn định và hoàn toàn nằm trong sai số cho phép của con người."

---

## Slide 15: Pronunciation Scoring Evaluation

**[Slide Text]**
* **Test Set:** 50 word pairs (Exact to Severe error).
* **Correlation:** -0.95 Spearman Rank.
* **Finding:** IPA weighting successfully discriminates phonetic errors.

**[Speaker Notes - English]**
"For pronunciation, we evaluated 50 word pairs ranging from perfect articulation to severe errors.
Our multi-metric system achieved a strong negative correlation of -0.95 with error severity.
Crucially, it proved that our IPA grouping successfully catches phonetic errors that simple text-matching algorithms miss."

**[Speaker Notes - Vietnamese]**
"Về phát âm, nhóm đánh giá trên 50 từ với các mức độ sai khác nhau.
Hệ thống đạt hệ số tương quan -0.95 với mức độ nghiêm trọng của lỗi sai.
Quan trọng nhất, kết quả chứng minh việc phân nhóm âm vị IPA giúp AI bắt lỗi phát âm chính xác hơn hẳn so với việc chỉ so khớp chữ cái thông thường."

---

## Slide 16: FSRS Simulation & System Performance

**[Slide Text]**
* **FSRS Simulation:** Verified bounded intervals (User A: 365 days, User C: 5 days).
* **Performance:** AI inference < 25s; Standard API < 80ms.
* **Future Work:** Large-scale validation & longitudinal studies.

**[Speaker Notes - English]**
"We also simulated the FSRS vocabulary algorithm, proving it effectively limits review intervals to 365 days for strong students, while keeping struggling students at 5-day intervals.
In terms of performance, AI grading completes in under 25 seconds, while regular actions take less than 80 milliseconds.
Future work will focus on larger-scale validation and longitudinal user studies to track long-term improvement."

**[Speaker Notes - Vietnamese]**
"Nhóm cũng chạy mô phỏng thuật toán từ vựng FSRS, kết quả cho thấy hệ thống phân loại rất tốt: học sinh giỏi được giãn lịch tối đa 365 ngày, còn học sinh yếu bị giữ ở mức 5 ngày.
Về hiệu năng, AI chấm điểm mất tối đa 25 giây, trong khi các thao tác bình thường chỉ tốn chưa tới 80 mili-giây.
Hướng phát triển tương lai sẽ là mở rộng tập dữ liệu kiểm thử và theo dõi hiệu quả học tập thực tế của sinh viên."

---

## Slide 17: Conclusion & Future Work

**[Slide Text]**
* **Impact:** Addressed 3 key gaps (Validated Grading, Local STT, IELTS FSRS).
* **Viability:** Proven as a highly reliable formative assessment tool.
* **Future Focus 1:** Large-scale, diverse dataset validation.
* **Future Focus 2:** Phoneme-level ground truth evaluation.
* **Future Focus 3:** 4–8 week longitudinal student impact study.

**[Speaker Notes - English]**
"To conclude, IELTS Master English AI successfully addresses the three major gaps in current platforms by providing validated LLM grading, local multimodal speech assessment, and adaptive vocabulary scheduling.
The data proves it is a highly viable formative assessment tool.
Looking ahead, our three main priorities are validating on a much larger dataset, testing pronunciation against phoneme-level ground truths, and running a four to eight-week longitudinal study to measure actual student score improvements.
Thank you for listening!"

**[Speaker Notes - Vietnamese]**
"Tóm lại, IELTS Master English AI đã giải quyết thành công 3 lỗ hổng lớn nhất hiện nay bằng việc cung cấp hệ thống chấm điểm AI đáng tin cậy, tự xử lý giọng nói đa phương thức, và thuật toán từ vựng tối ưu.
Các số liệu chứng minh đây là một công cụ hỗ trợ ôn thi cực kỳ khả thi.
Định hướng tương lai của nhóm là mở rộng tập dữ liệu kiểm thử, đánh giá phát âm bằng dữ liệu có gán nhãn âm vị chuẩn, và triển khai cho sinh viên dùng thử trong 4 đến 8 tuần để đo lường mức độ cải thiện điểm số thực tế.
Nhóm xin chân thành cảm ơn hội đồng đã lắng nghe!"
