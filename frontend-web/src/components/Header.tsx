"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isIeltsDashboard = pathname === "/ielts";
  const isIeltsIntensive = pathname.startsWith("/ielts/intensive");
  const isIeltsHistory = pathname.startsWith("/ielts/history");
  const isIelts = pathname.startsWith("/ielts") && !isIeltsDashboard && !isIeltsIntensive && !isIeltsHistory;

  const [forcePlain, setForcePlain] = useState(false);

  useEffect(() => {
    setForcePlain(false);
  }, [pathname]);

  useEffect(() => {
    const handleSetForcePlain = (e: any) => setForcePlain(e.detail);
    window.addEventListener('set-header-plain', handleSetForcePlain);
    return () => window.removeEventListener('set-header-plain', handleSetForcePlain);
  }, []);

  const plainPages = ["/login", "/register"];
  const isPlain = plainPages.includes(pathname) || isIeltsIntensive || isIeltsHistory || forcePlain;

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

  if (pathname.includes("/take/") || pathname.endsWith("/start")) {
    return null;
  }

  const isOverlay = !isPlain && !isIeltsDashboard;

  const headerBgClass = isIeltsDashboard
    ? "bg-transparent absolute w-full top-0 border-transparent shadow-none"
    : isIelts
      ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-light top-0 border-primary/40 shadow-lg shadow-black/30 backdrop-blur-sm"
      : isPlain
        ? "bg-white/95 top-0 border-gray-200 shadow-[0_4px_30px_rgb(0,0,0,0.03)] backdrop-blur-xl"
        : "bg-transparent absolute w-full top-0 border-transparent shadow-none";


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
    `relative text-sm uppercase tracking-wider transition-colors pt-2 pb-1 group hover:text-primary ${active ? "text-primary" : isOverlay || isIelts ? "text-light" : "text-gray-600"
    }`;

  return (
    <header
      className={`border-b z-50 transition-all duration-300 ${headerBgClass}`}
    >
      <div className="container mx-auto max-w-screen-xl px-4 py-4 flex justify-between items-center">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={
                isOverlay || isIelts
                  ? "https://res.cloudinary.com/dalaaegob/image/upload/v1772714388/Logo_rvszzb.png"
                  : "https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
              }
              alt="TOEIC Master AI Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex gap-10 font-bold items-center ml-10">
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
          </nav>
        </div>

        {/* Right: Vocab Lab icon + Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Vocab Lab pill */}
          <Link
            href="/vocab-lab"
            className={`group flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-md ${pathname === "/vocab-lab" || pathname.startsWith("/vocab-lab/")
              ? "bg-amber-400 text-white shadow-md shadow-amber-200"
              : isOverlay || isIelts
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

          {user ? (
            /* ── Logged-in: avatar + dropdown ── */
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 transition-colors hover:bg-white/10 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
              >
                {/* Avatar circle */}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold select-none shrink-0">
                  {initials}
                </span>
                {/* Name */}
                <span
                  className={`text-sm font-semibold max-w-[140px] truncate ${isOverlay || isIelts ? "text-white" : "text-gray-800"
                    }`}
                >
                  {displayName}
                </span>
                {/* Chevron */}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""
                    } ${isOverlay || isIelts ? "text-white/70" : "text-gray-400"}`}
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
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white shadow-xl py-1 z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {displayName}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
          ) : (
            /* ── Logged-out: Sign In + Register ── */
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`text-sm font-semibold transition-colors hover:text-primary ${isOverlay || isIelts ? "text-white" : "text-gray-700"
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
          className={`md:hidden p-2 ${isOverlay || isIelts ? "text-white" : "text-gray-600"
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
        <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-4 shadow-lg absolute w-full left-0 top-full z-50">
          <div className="flex flex-col gap-4 pt-2">
            <Link
              href="/"
              className="font-bold text-gray-800 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              HOME
            </Link>
            <Link
              href="/ielts"
              className="font-bold text-gray-800 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              IELTS
            </Link>

            <Link
              href="/shadowing-dictation"
              className="font-bold text-gray-800 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              SHADOWING &amp; DICTATION
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
            {user ? (
              <>
                {/* Avatar row */}
                <div className="flex items-center gap-3 pb-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-bold select-none shrink-0">
                    {initials}
                  </span>
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
