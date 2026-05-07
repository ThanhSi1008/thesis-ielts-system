"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import PreviewCarousel from "@/components/PreviewCarousel";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setError("");
    try {
      await loginWithGoogle(idToken);
      router.push("/");
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      {/* Left Panel - Interactive Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12 lg:py-0 relative">
        <div className="max-w-[420px] w-full">
          <div className="mb-10 text-center">
            <Link href="/" className="inline-block mb-8">
              <img
                src="https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
                alt="Lexon Logo"
                className="h-16 dark:hidden"
              />
              <img
                src="https://res.cloudinary.com/dalaaegob/image/upload/v1772714388/Logo_rvszzb.png"
                alt="Lexon Logo"
                className="h-16 hidden dark:block"
              />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 dark:text-slate-400 font-medium text-sm">Sign in to continue your learning journey.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="mb-6">
            <GoogleSignInButton onSuccess={handleGoogleSuccess} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-primary">Email address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-primary">Password</label>
                <Link href="#" className="text-xs font-medium text-primary hover:text-amber-500 transition-colors">Forgot password?</Link>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FFC600] hover:bg-[#F2BC00] text-black font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex justify-center items-center mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400 font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4">
              Create one now
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Animated ambient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 z-0"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FFC600]/15 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[10000ms] delay-1000"></div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          <PreviewCarousel />
        </div>
      </div>
    </div>
  );
}
