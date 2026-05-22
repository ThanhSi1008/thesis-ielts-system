# Lexon Mobile Asset Optimization & Auditing Guidelines

Tài liệu này cung cấp các tiêu chuẩn kỹ thuật về quản lý, tối ưu hóa và kiểm định tài nguyên (hình ảnh, biểu tượng vector, SVG) trong dự án React Native Expo. Tối ưu hóa tài nguyên giúp giảm dung lượng file APK/IPA (bundle size), rút ngắn thời gian phản hồi (INP) và chống tràn bộ nhớ (OOM).

---

## 1. Tối ưu hóa Hình ảnh Tĩnh (Local Image Optimization)

Các ảnh trang trí tĩnh (PNG, JPG) nằm trong thư mục `assets/` phải được kiểm định định kỳ.

### Tiêu chuẩn kỹ thuật:
- **Độ phân giải tối đa**: Không vượt quá gấp đôi kích thước hiển thị vật lý lớn nhất (2x density). Ví dụ: Một bức ảnh hiển thị `100x100 dp` chỉ cần độ phân giải vật lý `200x200 px`.
- **Dung lượng tệp tin giới hạn**:
  - Biểu tượng/Trang trí nhỏ: `< 30 KB`.
  - Ảnh minh họa lớn (Illustrations): `< 150 KB`.
  - Ảnh nền (Backgrounds): `< 250 KB`.
- **Định dạng tối ưu**: Ưu tiên sử dụng WebP hoặc PNG nén sâu thông qua công cụ `tinypng` hoặc script nén của Expo:
  ```bash
  npx expo-optimize
  ```

---

## 2. Quy chuẩn Vector SVG (SVG to React Native Components)

Không tải tệp SVG trực tiếp bằng thẻ `<Image>` thô vì sẽ làm tăng tài nguyên xử lý XML thời gian thực của thiết bị. Thay vào đó, tất cả các biểu tượng và hình minh họa vector phải được biên dịch thành component tĩnh sử dụng thư viện `react-native-svg`.

### Ví dụ về Component SVG Tối Ưu:
```tsx
import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export default function BookIcon({ width = 24, height = 24, fill = 'currentColor', ...props }: SvgProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={fill}
      />
    </Svg>
  );
}
```

---

## 3. Quản lý Hình ảnh Từ xa & Caching với `expo-image`

Đối với các hình ảnh được tải từ Server (ví dụ: ảnh đại diện người dùng, ảnh bài viết cộng đồng, ảnh bìa bài học), **tuyệt đối không sử dụng** thành phần `<Image>` mặc định của React Native. Bắt buộc sử dụng `expo-image` để có hiệu năng vượt trội.

### Ưu điểm của `expo-image`:
- Tự động lưu bộ nhớ đệm (disk-memory caching) cực kỳ thông minh.
- Hỗ trợ định dạng ảnh hiện đại (WebP, AVIF).
- Khởi chạy mượt mà trên UI thread (sử dụng thư viện native SDWebImage trên iOS và Glide trên Android).
- Tích hợp hiệu ứng chuyển cảnh mượt mà (cross-fade transition) giảm thiểu hiện tượng nhấp nháy màn hình.

### Quy chuẩn Triển khai:
```tsx
import { Image } from 'expo-image';

export function UserAvatar({ uri }: { uri: string }) {
  return (
    <Image
      source={uri}
      style={styles.avatar}
      placeholder="blurhash-string-representing-placeholder" // Tránh giật lag khung hình
      contentFit="cover"
      transition={200} // Hiệu ứng fade in 200ms
      cachePolicy="memory-disk" // Lưu trữ đệm cả RAM và đĩa cứng
    />
  );
}
```

---

## 4. Cấu trúc tổ chức thư mục tài nguyên (Assets Directory)

Tài nguyên trong dự án phải được phân loại rõ ràng theo cấu trúc dưới đây để tránh trùng lặp:
```
frontend-mobile/assets/
├── fonts/               # Các font chữ Farro (.ttf)
├── icons/               # Các biểu tượng vector cỡ nhỏ
├── illustrations/       # Ảnh minh họa SVG/PNG lớn cho EmptyState hoặc Onboarding
├── images/              # Ảnh tĩnh cố định (Logo, Default Avatar)
└── empty-states.ts      # Danh sách khai báo tĩnh các tài nguyên trạng thái trống
```
