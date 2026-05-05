"use client";

import { useProfileData } from "./_hooks/useProfileData";
import ProfileHeader from "./_components/ProfileHeader";
import PersonalInfoForm from "./_components/PersonalInfoForm";
import ChangePasswordForm from "./_components/ChangePasswordForm";
import DeleteAccountSection from "./_components/DeleteAccountSection";
import { CheckCircle, XCircle } from "lucide-react";
import XpLevelBar from "./_components/XpLevelBar";
import AchievementsSection from "./_components/AchievementsSection";
import SubscriptionSection from "./_components/SubscriptionSection";
import { gamificationApi } from "@/services/gamification.api";
import { useEffect, useState, Suspense } from "react";
import type { GamificationProfile, AchievementItem } from "@/types";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/contexts/SubscriptionContext";

function ProfileTabs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "account";
  const [gamProfile, setGamProfile] = useState<GamificationProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const { tier, status, currentPeriodEnd, trialEndsAt, isTrial } = useSubscription();

  useEffect(() => {
    gamificationApi.getProfile().then(setGamProfile).catch(() => { });
    gamificationApi.getAchievements().then(setAchievements).catch(() => { });
  }, []);
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
      <div className="h-full bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-full bg-white dark:bg-slate-950 pt-4 pb-4 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Feedback Message */}
        {message && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium animate-fade-up ${message.type === "success"
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

        {currentTab === "account" && (
          <>
            <ProfileHeader
              firstName={profile.firstName || ""}
              lastName={profile.lastName || ""}
              email={profile.email}
              createdAt={profile.createdAt}
              avatar={profile.avatar}
            />
            <SubscriptionSection
              tier={tier}
              status={status}
              currentPeriodEnd={currentPeriodEnd}
              trialEndsAt={trialEndsAt}
              isTrial={isTrial}
            />
            <PersonalInfoForm
              firstName={profile.firstName || ""}
              lastName={profile.lastName || ""}
              email={profile.email}
              saving={saving}
              onSave={updateProfile}
            />
          </>
        )}

        {currentTab === "gamification" && (
          <>
            {gamProfile && (
              <XpLevelBar
                level={gamProfile.level}
                currentLevelXp={gamProfile.currentLevelXp}
                xpNeeded={gamProfile.xpNeeded}
                totalXp={gamProfile.totalXp}
              />
            )}
            {achievements.length > 0 && (
              <AchievementsSection
                achievements={achievements}
                earnedCount={gamProfile?.achievementCount ?? 0}
                totalCount={gamProfile?.totalAchievements ?? 0}
              />
            )}
          </>
        )}

        {currentTab === "security" && (
          <>
            {!profile.googleId ? (
              <ChangePasswordForm
                changingPassword={changingPassword}
                onSubmit={changePassword}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Signed in with Google</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Password management is handled by your Google account.</p>
                </div>
              </div>
            )}
          </>
        )}

        {currentTab === "danger" && (
          <DeleteAccountSection
            deleting={deleting}
            onDelete={deleteAccount}
          />
        )}
      </div>
    </div>
  );
}

export default function ProfileContent() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ProfileTabs />
    </Suspense>
  );
}
