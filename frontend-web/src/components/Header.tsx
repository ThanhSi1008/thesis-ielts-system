"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Pages with no PageHeader (plain white nav)
  const plainPages = ["/login", "/register"];
  const isPlain = isHome || plainPages.includes(pathname);
  // On all other pages the nav overlays the PageHeader hero
  const isOverlay = !isPlain;

  return (
    <header className={`
      border-b z-50 transition-all duration-300
      ${isPlain && !isOverlay
        ? isHome
          ? "bg-transparent absolute w-full top-0 border-transparent shadow-none"
          : "bg-white shadow-sm sticky top-0 border-gray-100"
        : "bg-transparent absolute w-full top-0 border-transparent shadow-none"
      }
    `}>
      <div className="container mx-auto max-w-screen-xl px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src={isOverlay
              ? "https://res.cloudinary.com/dalaaegob/image/upload/v1772714388/Logo_rvszzb.png"
              : "https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
            }
            alt="TOEIC Master AI Logo"
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 font-medium items-center">

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className={`text-sm font-semibold ${isOverlay ? 'text-white' : 'text-gray-900'}`}>Hello, {user.fullName || user.email}</span>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className={`font-medium transition-colors ${isOverlay ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                Login
              </Link>
              <Link href="/register" className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 ${isOverlay ? 'text-white' : 'text-gray-600'}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-4 shadow-lg absolute w-full left-0">

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <span className="text-sm font-semibold">Signed in as {user.email}</span>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left py-2 text-red-600 font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link href="/register" className="block py-2 font-medium text-primary" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
