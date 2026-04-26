import { z } from 'zod';

/**
 * Lược đồ kiểm tra tính hợp lệ (Validation Schema) cho form đăng nhập
 * Sử dụng Zod để đảm bảo độ chính xác của kiểu dữ liệu.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

// Nội suy (Infer) TypeScript Type từ Zod schema
// Type này sẽ được đưa vào làm generic type cho React Hook Form
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Định nghĩa interface cho response trả về từ API Auth
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}
