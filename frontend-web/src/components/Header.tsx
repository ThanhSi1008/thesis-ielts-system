"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  // Pages with no PageHeader (plain white nav)
  const plainPages = ["/login", "/register", "/ielts"];
  const isPlain = plainPages.includes(pathname) || pathname.startsWith("/ielts/intensive");
  
  if (pathname.includes("/take/")) {
    return null;
  }

  // On all other pages the nav overlays the PageHeader hero
  const isOverlay = !isPlain;

  return (
    <header className={`
      border-b z-50 transition-all duration-300
      ${isPlain
        ? "bg-white shadow-sm sticky top-0 border-gray-100"
        : "bg-transparent absolute w-full top-0 border-transparent shadow-none"
      }
    `}>
      <div className="container mx-auto max-w-screen-xl px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src={isOverlay
                ? "https://res.cloudinary.com/dalaaegob/image/upload/v1772714388/Logo_rvszzb.png"
                : "https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
              }
              alt="TOEIC Master AI Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Center */}
          <nav className="hidden md:flex gap-10 font-bold items-center justify-center flex-1 ml-10">
            <Link href="/" className={`relative text-sm uppercase tracking-wider transition-colors pt-2 pb-1 group ${pathname === '/' ? 'text-primary' : (isOverlay ? 'text-white' : 'text-gray-600')}`}>
              HOME
              <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full"></span>
            </Link>
            <Link href="/ielts" className={`relative text-sm uppercase tracking-wider transition-colors pt-2 pb-1 group ${pathname === '/ielts' ? 'text-primary' : (isOverlay ? 'text-white' : 'text-gray-600')}`}>
              IELTS
              <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full"></span>
            </Link>
            <Link href="/vocab-lab" className={`relative text-sm uppercase tracking-wider transition-colors pt-2 pb-1 group ${(pathname === '/vocab-lab' || pathname.startsWith('/vocab-lab/')) ? 'text-primary' : (isOverlay ? 'text-white' : 'text-gray-600')}`}>
              VOCAB LAB
              <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full"></span>
            </Link>
            <Link href="/shadowing-dictation" className={`relative text-sm uppercase tracking-wider transition-colors pt-2 pb-1 group ${(pathname === '/shadowing-dictation' || pathname.startsWith('/shadowing-dictation/')) ? 'text-primary' : (isOverlay ? 'text-white' : 'text-gray-600')}`}>
              SHADOWING & DICTATION
              <span className="absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-300 w-0 group-hover:w-full"></span>
            </Link>
          </nav>
        </div>

        {/* Right Section: Auth */}
        <div className="hidden md:flex items-center gap-8">
          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className={`text-sm font-semibold ${isOverlay ? 'text-white' : 'text-gray-900'}`}>Hello, {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}</span>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 group">
              <img src="https://res.cloudinary.com/dalaaegob/image/upload/v1772879077/ae371d4a-9b66-4a55-abe6-06695c9f6986.png" alt="Sign In" className="h-8 w-8 object-contain" />
              <span className={`font-semibold text-sm hover:underline ${isOverlay ? 'text-white' : 'text-gray-700'}`}>Sign In</span>
            </Link>
          )}
        </div>

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
        <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-4 shadow-lg absolute w-full left-0 top-full">
          <div className="flex flex-col gap-4 pt-2">
            <Link href="/" className="font-bold text-gray-800 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>HOME</Link>
            <Link href="/ielts" className="font-bold text-gray-800 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>IELTS</Link>
            <Link href="/vocab-lab" className="font-bold text-gray-800 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>VOCAB LAB</Link>
            <Link href="/shadowing-dictation" className="font-bold text-gray-800 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>SHADOWING & DICTATION</Link>
          </div>
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <span className="text-sm font-semibold">Signed in as {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}</span>
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
