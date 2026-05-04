"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp, signInWithApple } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Role = "listener" | "artist" | "streamer";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("listener");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await signUp(email, password);

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          role,
        });
      }

      router.push("/app");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign up failed. Please try again.";
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

  const roles: { value: Role; label: string }[] = [
    { value: "listener", label: "Listener" },
    { value: "artist", label: "Artist" },
    { value: "streamer", label: "Streamer" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-56 h-56 bg-accent-purple/25 rounded-full blur-[90px]" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent-blue/15 rounded-full blur-[70px]" />

      {/* Logo */}
      <div className="relative z-10 mb-3 w-14 h-14">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="signupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path
            d="M25 20h50L35 50h30L25 80"
            stroke="url(#signupGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="50"
            y1="12"
            x2="50"
            y2="88"
            stroke="url(#signupGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className="relative z-10 text-2xl font-bold tracking-wide mb-1">
        Create your account
      </h1>
      <p className="relative z-10 text-sm text-text-muted mb-5">
        Join the Zeeky community
      </p>

      {/* Form */}
      <form
        onSubmit={handleSignUp}
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
          autoComplete="new-password"
          className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-text-muted/40 focus:outline-none focus:border-accent-purple/50 transition-colors"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-text-muted/40 focus:outline-none focus:border-accent-purple/50 transition-colors"
        />

        {/* Role selection */}
        <div className="pt-1">
          <p className="text-xs text-text-muted/60 mb-2">I am a...</p>
          <div className="flex gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  role === r.value
                    ? "bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-lg shadow-accent-purple/20"
                    : "bg-surface border border-white/10 text-text-muted hover:border-white/20"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
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
          {loading ? "Creating account..." : "Create Account"}
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

      {/* Sign in link */}
      <p className="relative z-10 text-sm text-text-muted mt-5">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-accent-purple font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
