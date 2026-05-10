import api from "@/lib/api";
import type { User } from "@/types";

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const usersApi = {
  getMe: (): Promise<User> =>
    api.get<User>("/users/me").then((r) => r.data),

  updateMe: (data: UpdateProfileData): Promise<User> =>
    api.patch<User>("/users/me", data).then((r) => r.data),

  changePassword: (data: ChangePasswordData): Promise<{ message: string }> =>
    api.post<{ message: string }>("/auth/change-password", data).then((r) => r.data),

  deleteAccount: (): Promise<{ message: string }> =>
    api.delete<{ message: string }>("/users/me").then((r) => r.data),
};
