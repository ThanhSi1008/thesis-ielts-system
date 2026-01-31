"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto max-w-screen-xl px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:bg-primary transition-colors">
            T
          </div>
          <h1 className="text-2xl font-bold group-hover:text-primary transition-colors">
            TOEIC Master AI
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 font-medium items-center">

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">Hello, {user.fullName || user.email}</span>
              <button
                onClick={logout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-600 hover:text-black font-medium transition-colors">
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
          className="md:hidden p-2 text-gray-600"
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
