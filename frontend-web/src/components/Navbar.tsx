"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIeltsSidebar } from "@/contexts/IeltsSidebarContext";
import api from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import { vocabLabApi } from "@/services/vocabLab.api";
import { gamificationApi } from "@/services/gamification.api";
import { useSubscription } from "@/contexts/SubscriptionContext";
import SubscriptionBadge from "@/components/SubscriptionBadge";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { tier } = useSubscription();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { toggleSidebar } = useIeltsSidebar();
  const { unreadCount, isDropdownOpen, toggleDropdown } = useNotifications();
  const isIeltsDashboard = pathname === "/ielts";
  const isIeltsInternal = pathname.startsWith("/ielts/");
  const isIeltsPage = isIeltsDashboard || isIeltsInternal;
  const isShadowingPage = pathname.startsWith("/shadowing-dictation");
  const isVocabLabPage = pathname === "/vocab-lab" || pathname.startsWith("/vocab-lab/");
  const isCommunityPage = pathname === "/community" || pathname.startsWith("/community/");
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/");
  const isHeaderBorderless = isIeltsPage || isShadowingPage || isVocabLabPage || isCommunityPage || isProfilePage;

  const [forcePlain, setForcePlain] = useState(false);

  useEffect(() => {
    setForcePlain(false);
  }, [pathname]);

  useEffect(() => {
    const handleSetForcePlain = (e: Event) => setForcePlain((e as CustomEvent).detail);
    window.addEventListener('set-header-plain', handleSetForcePlain);
    return () => window.removeEventListener('set-header-plain', handleSetForcePlain);
  }, []);

  const plainPages = ["/login", "/register", "/profile", "/pricing"];
  const isAdminPage = pathname.startsWith("/admin");
  const isPaymentPage = pathname.startsWith("/payment");
  const isPlain = plainPages.includes(pathname) || isIeltsInternal || isShadowingPage || isVocabLabPage || isAdminPage || isCommunityPage || isPaymentPage || forcePlain;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch streak
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number } | null>(null);

  // Fetch user level
  const [userLevel, setUserLevel] = useState<number>(0);

  useEffect(() => {
    if (user) {
      gamificationApi.getProfile()
        .then(res => setUserLevel(res.level))
        .catch(() => {});
    }
  }, [user, pathname]);

  // Fetch vocab due count
  const [vocabDue, setVocabDue] = useState(0);

  const fetchVocabDue = () => {
    if (!user) { setVocabDue(0); return; }
    vocabLabApi.getDecks()
      .then(decks => {
        const total = decks.reduce((sum, d) => sum + d.newCount + d.learningCount + d.dueCount, 0);
        setVocabDue(total);
      })
      .catch(() => { }); // silently fail — it's just a badge
  };

  useEffect(() => {
    fetchVocabDue();
  }, [user, pathname]);

  // Re-fetch whenever a card is reviewed (dispatched by study page)
  useEffect(() => {
    window.addEventListener('vocabduechanged', fetchVocabDue);
    return () => window.removeEventListener('vocabduechanged', fetchVocabDue);
  }, [user]);

  useEffect(() => {
    if (user) {
      api.get<{ currentStreak: number; longestStreak: number }>("/ielts/streak")
        .then(res => setStreak(res.data))
        .catch(err => console.error("Failed to load streak", err));
    }
  }, [user, pathname]); // Re-fetch occasionally when navigating around

  if (
    pathname.includes("/take/") ||
    pathname.includes("/practice/") ||
    pathname.endsWith("/start") ||
    pathname === "/ielts/basic/onboarding" ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null;
  }

  const isOverlay = !isPlain && !isIeltsDashboard;

  const positionClass = isPlain ? "sticky" : "absolute w-full";

  const headerBgClass = isIeltsDashboard
    ? "bg-transparent border-transparent shadow-none"
    : isPlain
      ? `bg-white/95 dark:bg-gray-900/95 ${isHeaderBorderless ? '' : 'border-gray-200 dark:border-gray-800 shadow-[0_4px_30px_rgb(0,0,0,0.03)]'} backdrop-blur-xl`
      : "bg-transparent border-transparent shadow-none";


  // Derive display name and initials from user
  const displayName = user
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email
    : "";
  const initials = user
    ? user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.email.slice(0, 2).toUpperCase()
    : "";

  const navLinkClass = (active: boolean) =>
    `relative text-sm uppercase tracking-wider transition-colors pt-2 pb-1 group hover:text-primary ${active ? "text-primary" : isOverlay ? "text-light" : "text-gray-600"
    }`;



  return (
    <header
      className={`${positionClass} top-0 z-50 ${isHeaderBorderless ? '' : 'border-b'} transition-all duration-300 ${headerBgClass} h-[56px] flex items-center`}
    >
      <div className={`${isHeaderBorderless ? "w-full max-w-none px-4" : "container mx-auto max-w-screen-xl px-4"} py-2 flex justify-between items-center`}>
        {/* Left: Hamburger (IELTS) + Logo + Nav */}
        <div className="flex items-center gap-4">
          {/* Hamburger for Sidebar pages */}
          {isHeaderBorderless && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 -ml-2"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <img
              src={
                isOverlay
                  ? "https://res.cloudinary.com/dalaaegob/image/upload/v1772714388/Logo_rvszzb.png"
                  : "https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
              }
              alt="TOEIC Master AI Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex gap-8 font-semibold items-center ml-8">
            <Link href="/" className={navLinkClass(pathname === "/")}>
              HOME
              <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full" />
            </Link>
            <Link
              href="/ielts"
              className={navLinkClass(
                pathname === "/ielts" || pathname.startsWith("/ielts/")
              )}
            >
              IELTS
              <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full" />
            </Link>

            <Link
              href="/shadowing-dictation"
              className={navLinkClass(
                pathname === "/shadowing-dictation" ||
                pathname.startsWith("/shadowing-dictation/")
              )}
            >
              SHADOWING &amp; DICTATION
              <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full" />
            </Link>

            <Link
              href="/community"
              className={navLinkClass(
                pathname === "/community" || pathname.startsWith("/community/")
              )}
            >
              COMMUNITY
              <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full" />
            </Link>

            <Link
              href="/pricing"
              className={navLinkClass(pathname === "/pricing")}
            >
              PRICING
              <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full" />
            </Link>
          </nav>
        </div>

        {/* Right: Vocab Lab icon + Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Vocab Lab pill */}
          <div className="relative">
            <Link
              href="/vocab-lab"
              className={`group flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-md ${pathname === "/vocab-lab" || pathname.startsWith("/vocab-lab/")
                ? "bg-amber-400 text-white shadow-md shadow-amber-200"
                : isOverlay
                  ? "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                  : "bg-amber-400/10 text-amber-600 hover:bg-amber-400 hover:text-white border border-amber-300"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Vocab Lab
            </Link>
            {/* Due badge */}
            {vocabDue > 0 && (
              <span className="pointer-events-none absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none shadow-sm">
                {vocabDue > 99 ? '99+' : vocabDue}
              </span>
            )}
          </div>

          {user ? (
            /* ── Logged-in: streak + avatar + dropdown ── */
            <div className="flex items-center gap-3">
              {streak && streak.currentStreak > 0 && (
                <Link
                  href="/profile?tab=gamification"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-bold shadow-sm transition-all duration-300 hover:scale-105 ${isOverlay
                    ? "bg-white/10 border-white/20 text-white shadow-black/10 hover:bg-white/20"
                    : "bg-orange-50 border-orange-200 text-orange-600 shadow-orange-100/50 hover:bg-orange-100"
                    }`}
                  title={`🔥 ${streak.currentStreak}-day streak! Your longest: ${streak.longestStreak}`}
                >
                  <Flame 
                    className={`w-4 h-4 text-orange-500 ${streak.currentStreak >= 7 ? 'animate-pulse' : ''} drop-shadow-sm fill-orange-500`}
                  />
                  <span>{streak.currentStreak}</span>
                </Link>
              )}

              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className={`p-2 rounded-full transition-colors ${isOverlay
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                {resolvedTheme === 'dark' ? (
                  /* Sun icon */
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="5" />
                    <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  /* Moon icon */
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>

              {/* Bell Icon */}
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  id="notification-bell-btn"
                  aria-label="Notifications"
                  className={`relative p-2 rounded-full transition-colors ${isDropdownOpen
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    : isOverlay
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5 leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {isDropdownOpen && <NotificationDropdown />}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((o) => !o)}
                  className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 transition-colors hover:bg-black/5 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                >
                  {/* Avatar circle */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="flex h-8 w-8 rounded-full object-cover shrink-0 ring-2 ring-primary/30"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold select-none shrink-0">
                      {initials}
                    </span>
                  )}
                  {/* Name */}
                  <span
                    className={`text-sm font-semibold max-w-[120px] truncate ${isOverlay ? "text-white" : "text-gray-800"
                      }`}
                  >
                    {displayName}
                  </span>
                  <span className="text-[10px] font-bold bg-primary/15 text-primary rounded-full px-1.5 py-0.5 ml-1">
                    Lv.{userLevel}
                  </span>
                  <SubscriptionBadge tier={tier} size="sm" />
                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""
                      } ${isOverlay ? "text-white/70" : "text-gray-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl dark:shadow-black/40 py-1 z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-0.5">
                        Signed in as
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {displayName}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        My Profile
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Logged-out: Sign In + Register ── */
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`text-sm font-semibold transition-colors hover:text-primary ${isOverlay ? "text-white" : "text-gray-700"
                  }`}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold rounded-lg bg-primary px-4 py-2 text-white transition-opacity hover:opacity-90"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 ${isOverlay ? "text-white" : "text-gray-600"
            }`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-4 shadow-lg absolute w-full left-0 top-full z-50">
          <div className="flex flex-col gap-4 pt-2">
            <Link
              href="/"
              className="font-bold text-gray-800 dark:text-gray-200 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              HOME
            </Link>
            <Link
              href="/ielts"
              className="font-bold text-gray-800 dark:text-gray-200 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              IELTS
            </Link>

            <Link
              href="/shadowing-dictation"
              className="font-bold text-gray-800 dark:text-gray-200 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              SHADOWING &amp; DICTATION
            </Link>

            <Link
              href="/community"
              className="font-bold text-gray-800 dark:text-gray-200 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              COMMUNITY
            </Link>

            <Link
              href="/pricing"
              className="font-bold text-gray-800 dark:text-gray-200 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              PRICING
            </Link>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-col gap-2">
            {user ? (
              <>
                {/* Avatar row */}
                <div className="flex items-center gap-3 pb-2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="flex h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-bold select-none shrink-0">
                      {initials}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 py-2 text-sm text-gray-700 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 py-2 text-sm text-red-500 font-medium text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 font-semibold text-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block py-2 font-semibold text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
