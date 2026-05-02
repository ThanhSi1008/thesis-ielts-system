"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(email, password, fullName);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
      setError("Google sign-up failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Animated ambient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 z-0"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FFC600]/15 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[10000ms] delay-1000"></div>

        <div className="relative z-10 p-12 text-center max-w-xl flex flex-col items-center">
          <Link href="/">
            <img
              src="https://res.cloudinary.com/dalaaegob/image/upload/v1772714388/Logo_rvszzb.png"
              alt="Lexon Logo"
              className="h-14 mb-12 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </Link>
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
            Start your journey to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC600] to-amber-300">English fluency.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            Join a community of ambitious learners achieving their dream band scores with personalized, AI-powered study plans.
          </p>
        </div>
      </div>

      {/* Right Panel - Interactive Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12 lg:py-0 relative">
        {/* Mobile Logo - Only shows on small screens */}
        <div className="absolute top-8 left-6 sm:left-12 lg:hidden">
          <Link href="/">
            <img
              src="https://res.cloudinary.com/dalaaegob/image/upload/v1772802715/9a1c3431-a5ce-4470-949b-8318ff2f3911.png"
              alt="Lexon Logo"
              className="h-8 dark:hidden"
            />
            <img
              src="https://res.cloudinary.com/dalaaegob/image/upload/v1772714388/Logo_rvszzb.png"
              alt="Lexon Logo"
              className="h-8 hidden dark:block"
            />
          </Link>
        </div>

        <div className="max-w-[420px] w-full mt-10 sm:mt-0">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Create Account</h1>
            <p className="text-gray-500 dark:text-slate-400 font-medium text-sm">Join Lexon and start your IELTS journey today.</p>
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
            <GoogleSignInButton onSuccess={handleGoogleSuccess} label="Sign up with Google" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-primary">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-primary">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
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
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
