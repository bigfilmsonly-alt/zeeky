"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeCodeForTokens } from "@/lib/platforms/spotify";

function SpotifyCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const authError = searchParams.get("error");

      if (authError) {
        setError(`Spotify authorization denied: ${authError}`);
        return;
      }

      if (!code) {
        setError("Missing authorization code from Spotify.");
        return;
      }

      try {
        await exchangeCodeForTokens(code);
        router.replace("/listen");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to complete Spotify authorization."
        );
      }
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050507] px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-lg font-semibold text-white">
            Connection Failed
          </h1>
          <p className="mb-6 text-sm text-white/60">{error}</p>
          <button
            onClick={() => router.replace("/listen")}
            className="rounded-full bg-[#1DB954] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Back to Zeeky
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050507]">
      <div className="text-center">
        <div className="mb-6 inline-block h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#1DB954]" />
        <p className="text-sm text-white/60">Connecting to Spotify...</p>
      </div>
    </div>
  );
}

export default function SpotifyCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050507]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#1DB954]" />
        </div>
      }
    >
      <SpotifyCallbackInner />
    </Suspense>
  );
}
