import { useState, useEffect, useCallback } from "react";
import { usersApi } from "@/services/users.api";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types";

interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
}

export function useProfileData() {
  const { user, refreshUser, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await usersApi.getMe();
      setProfile(data);
    } catch {
      // user data will fallback to AuthContext
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const clearMessage = () => setMessage(null);

  const updateProfile = async (data: ProfileState) => {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await usersApi.updateMe(data);
      setProfile(updated);
      await refreshUser();
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setChangingPassword(true);
    setMessage(null);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      setMessage({ type: "success", text: "Password changed successfully" });
      return true;
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to change password" });
      return false;
    } finally {
      setChangingPassword(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setMessage(null);
    try {
      await usersApi.deleteAccount();
      logout();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete account" });
      setDeleting(false);
    }
  };

  return {
    profile: profile || user,
    loading,
    saving,
    changingPassword,
    deleting,
    message,
    clearMessage,
    updateProfile,
    changePassword,
    deleteAccount,
  };
}
