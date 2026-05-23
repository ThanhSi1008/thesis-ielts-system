# Lexon Mobile Gradients Guideline

Tài liệu này định nghĩa hệ thống màu chuyển sắc (linear gradients) tiêu chuẩn của ứng dụng di động IELTS Lexon. Việc áp dụng đúng các dải màu này giúp giao diện trở nên hiện đại, bắt mắt, tạo điểm nhấn cao cấp (premium) và phân biệt rõ ràng các khu vực chức năng.

---

## 1. Dải màu chuyển sắc thương hiệu (Brand Gradients)

Đây là các dải màu được sử dụng rộng rãi cho các nút bấm hành động (CTA), huy hiệu Premium, linh vật AI hoặc các điểm nhấn trang trí quan trọng.

### 🌟 Premium Brand Gold (Vàng Gold Cao Cấp)
Sử dụng cho các chức năng đặc quyền Premium, nâng cấp tài khoản, bảng xếp hạng và các nút bấm nổi bật (FAB).
- **Mã màu**: `['#FFE082', '#FFC600', '#FFA000']`
- **Sử dụng**:
  ```tsx
  import { LinearGradient } from 'expo-linear-gradient';

  <LinearGradient
    colors={['#FFE082', '#FFC600', '#FFA000']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.gradientButton}
  />
  ```

### 🌌 Luxury Deep Dark (Nền Tối Sang Trọng)
Sử dụng cho các thẻ báo cáo kết quả, widget tính điểm IELTS hoặc giao diện đặc thù hỗ trợ tập trung cao độ.
- **Mã màu**: `['#1E293B', '#0F172A']` (Từ Slate 800 đến Slate 900)
- **Sử dụng**: Làm background cho các thẻ đặc biệt hiển thị Band Score.

---

## 2. Dải màu theo Kỹ năng IELTS (Skill-Specific Gradients)

Mỗi kỹ năng IELTS được gán một dải màu gradient trực quan giúp học viên dễ dàng nhận biết khi duyệt nhanh qua danh sách bài học.

| Kỹ năng | Dải màu chuyển sắc (Light -> Dark) | Mã màu HEX |
| :--- | :--- | :--- |
| **🎧 Listening** | Rose Light -> Rose Dark | `['#FDA4AF', '#E11D48']` |
| **📖 Reading** | Blue Light -> Blue Dark | `['#93C5FD', '#2563EB']` |
| **✍️ Writing** | Amber Light -> Amber Dark | `['#FDE68A', '#D97706']` |
| **🗣️ Speaking** | Purple Light -> Purple Dark | `['#C084FC', '#7C3AED']` |

---

## 3. Dải màu trạng thái ngữ nghĩa (Semantic Gradients)

Sử dụng cho các hộp thoại phản hồi kết quả làm bài của học viên, các trạng thái học tập.

### 🟢 Success Green (Hoàn thành / Đạt mục tiêu)
- **Mã màu**: `['#E8F5E9', '#A5D6A7']` (Opacity thấp cho light mode card) hoặc `['#A5D6A7', '#4CAF50']` (Cho các nút thành công).

### 🟡 Warning Orange (Trung bình / Cảnh báo)
- **Mã màu**: `['#FFF3E0', '#FFCC80']` hoặc `['#FFCC80', '#FF9800']`.

### 🔴 Error Red (Yếu / Cần cải thiện)
- **Mã màu**: `['#FFEBEE', '#EF9A9A']` hoặc `['#EF9A9A', '#F44336']`.

---

## 4. Hiệu ứng Glassmorphism & Overlays

Để tạo cảm giác chiều sâu (depth) cho giao diện cao cấp, kết hợp các gradient bán trong suốt và viền mỏng.

### Viền Gradient Glass (Glass Border Overlay)
- **Kỹ thuật**: Sử dụng viền ngoài màu trắng mờ kết hợp gradient nền mờ:
  ```typescript
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    backdropFilter: 'blur(20px)', // Sử dụng trên Web / iOS hỗ trợ
  }
  ```

---

## 5. Nguyên tắc thiết kế gradient WCAG AA

Khi hiển thị chữ đè lên trên nền Gradient, nhà phát triển phải đảm bảo độ tương phản tối thiểu **4.5:1**:
- **Nền Premium Gold**: Chữ đặt trên nền này bắt buộc phải là màu chữ tối (`#212529` hoặc `#1E293B`). Không dùng chữ màu trắng (`#FFFFFF`).
- **Nền Skill Gradients / Dark**: Sử dụng chữ màu trắng (`#FFFFFF`) hoặc màu sáng dịu (`#F8FAFC`).
