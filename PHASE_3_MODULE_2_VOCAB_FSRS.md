# Phase 3 - Module 2: Dữ liệu tĩnh & Vocab-Lab (FSRS)

## 1. Mục Tiêu Module (Goal)
- Nạp và hiển thị các thư viện từ vựng, ngữ pháp tĩnh.
- Xây dựng trải nghiệm học Flashcard áp dụng đúng thuật toán FSRS (chấm điểm 1-4).

## 2. UI Components (NativeWind v4 & English UI)
- `features/vocabulary/components/DeckCard.tsx`: Thẻ hiển thị một bộ từ vựng, số lượng thẻ due/learning. (Wrap bằng `React.memo` để tránh re-render).
- `features/vocab-lab/components/FlashcardViewer.tsx`: Thẻ học lật mặt (Front/Back). **Trải nghiệm lật thẻ (Flashcard Animation)**: BẮT BUỘC sử dụng `react-native-reanimated` chạy trên UI Thread (sử dụng `useSharedValue` và `interpolate` cho hiệu ứng xoay 3D `rotateY`). Component nhận `frontContent` và `backContent`, tự quản lý state lật thẻ cục bộ, tuyệt đối không dùng React State thông thường gây khựng UI.
- `features/vocab-lab/components/FSRSRatingBar.tsx`: Cụm 4 nút chấm điểm chuẩn FSRS (English Only): 1 - Again (Đỏ), 2 - Hard (Cam), 3 - Good (Xanh lá), 4 - Easy (Xanh dương).
- `components/feedback/EmptyState.tsx`: Component hiển thị khi user đã học hết thẻ. Text phải dùng Tiếng Anh: "You're all caught up for today!" hoặc "No cards due right now. Great job!".

## 3. Hooks / Data Fetching (TanStack Query & Optimistic Update)
- `features/vocab-lab/hooks/useDecks.ts`: `useQuery` lấy danh sách bộ thẻ kèm thông kê (từ API `/vocab-lab/decks`).
- `features/vocab-lab/hooks/useStudySession.ts`: 
  - `useQuery` lấy danh sách thẻ cần ôn (từ API `/vocab-lab/study/:deckId`).
  - `useMutation` để submit review. Payload `{ flashcardId, rating: 1|2|3|4 }` gọi lên API `/vocab-lab/review`.
  - **Cơ chế Optimistic Update (Hàng đợi không độ trễ)**: Khi user bấm rating, KHÔNG đợi API trả về 200 OK. Phải dùng `onMutate` (hoặc update state cục bộ) để ngay lập tức pop (xóa) thẻ đó khỏi danh sách và hiển thị thẻ tiếp theo. Request API sẽ chạy ngầm (Background Mutation) để đảm bảo trải nghiệm học không bị lag 0.5-1s mỗi thẻ.

## 4. Cấu trúc Routing (Expo Router `app/`)
- `app/(tabs)/vocabulary/index.tsx`: Màn hình danh sách các bộ từ vựng / thư viện.
- `app/(tabs)/vocab-lab/index.tsx`: Dashboard hiển thị tiến độ học tập và các Deck cần review hôm nay.
- `app/(tabs)/vocab-lab/study/[deckId].tsx`: Màn hình học chính thức (Dynamic route), tuyệt đối tuân thủ "Thin Route", truyền `deckId` vào component ở `features/`.

## 5. Acceptance Criteria (Tiêu chí nghiệm thu)
- Danh sách Deck hiển thị đúng data tĩnh, tái sử dụng `FlashList` tối ưu.
- Màn hình Study hiển thị Flashcard với nội dung mặt trước. Chạm vào thẻ sẽ hiện nội dung mặt sau và thanh FSRSRatingBar.
- Khi bấm rating (1,2,3,4), app gọi đúng API backend và load thẻ tiếp theo mà không gây giật lag (Re-render tối thiểu).
- Khi hết thẻ, tự động chuyển về giao diện `EmptyState` hoàn thành buổi học.
