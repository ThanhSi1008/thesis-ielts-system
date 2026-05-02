"use client";

import { useProfileData } from "./_hooks/useProfileData";
import ProfileHeader from "./_components/ProfileHeader";
import PersonalInfoForm from "./_components/PersonalInfoForm";
import ChangePasswordForm from "./_components/ChangePasswordForm";
import DeleteAccountSection from "./_components/DeleteAccountSection";
import { CheckCircle, XCircle } from "lucide-react";

export default function ProfileContent() {
  const {
    profile,
    loading,
    saving,
    changingPassword,
    deleting,
    message,
    clearMessage,
    updateProfile,
    changePassword,
    deleteAccount,
  } = useProfileData();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Feedback Message */}
        {message && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium animate-fade-up ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1">{message.text}</span>
            <button
              onClick={clearMessage}
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Profile Header */}
        <ProfileHeader
          firstName={profile.firstName || ""}
          lastName={profile.lastName || ""}
          email={profile.email}
          createdAt={profile.createdAt}
        />

        {/* Personal Info Form */}
        <PersonalInfoForm
          firstName={profile.firstName || ""}
          lastName={profile.lastName || ""}
          email={profile.email}
          saving={saving}
          onSave={updateProfile}
        />

        {/* Change Password */}
        <ChangePasswordForm
          changingPassword={changingPassword}
          onSubmit={changePassword}
        />

        {/* Delete Account */}
        <DeleteAccountSection
          deleting={deleting}
          onDelete={deleteAccount}
        />
      </div>
    </div>
  );
}
