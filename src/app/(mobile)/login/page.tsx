"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signInWithApple } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/app");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign in failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    try {
      await signInWithApple();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Apple sign in failed.";
      setError(message);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || resetLoading) return;
    setError("");
    setResetLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email);
      setResetSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset link.";
      setError(message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-56 h-56 bg-accent-purple/25 rounded-full blur-[90px]" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent-blue/15 rounded-full blur-[70px]" />

      {/* Logo */}
      <div className="relative z-10 mb-3 w-14 h-14">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="loginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path
            d="M25 20h50L35 50h30L25 80"
            stroke="url(#loginGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="50"
            y1="12"
            x2="50"
            y2="88"
            stroke="url(#loginGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className="relative z-10 text-2xl font-bold tracking-wide mb-1">
        Welcome back
      </h1>
      <p className="relative z-10 text-sm text-text-muted mb-6">
        Sign in to your Zeeky account
      </p>

      {showReset ? (
        /* Password Reset Flow */
        <div className="relative z-10 w-full max-w-[300px] space-y-3">
          {resetSuccess ? (
            <>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl py-3 px-3">
                <p className="text-xs text-green-400">
                  Check your email for a reset link
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setResetSuccess(false);
                  setError("");
                }}
                className="w-full text-sm text-accent-purple font-medium hover:underline"
              >
                Back to sign in
              </button>
            </>
          ) : (
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-text-muted/40 focus:outline-none focus:border-accent-purple/50 transition-colors"
              />

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 px-3">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3.5 bg-gradient-to-r from-accent-purple to-accent-blue rounded-2xl text-white font-bold text-[15px] active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/25 disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setError("");
                }}
                className="w-full text-sm text-accent-purple font-medium hover:underline"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      ) : (
        <>
          {/* Form */}
          <form
            onSubmit={handleSignIn}
            className="relative z-10 w-full max-w-[300px] space-y-3"
          >
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-text-muted/40 focus:outline-none focus:border-accent-purple/50 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-text-muted/40 focus:outline-none focus:border-accent-purple/50 transition-colors"
            />

            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setShowReset(true);
                  setError("");
                }}
                className="text-xs text-accent-purple font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 px-3">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-accent-purple to-accent-blue rounded-2xl text-white font-bold text-[15px] active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/25 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative z-10 w-full max-w-[300px] flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-text-muted/50">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Apple sign in */}
          <button
            onClick={handleApple}
            className="relative z-10 w-full max-w-[300px] flex items-center justify-center gap-2.5 py-3.5 bg-white rounded-2xl text-black font-semibold text-[15px] active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>

          {/* Sign up link */}
          <p className="relative z-10 text-sm text-text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-accent-purple font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
