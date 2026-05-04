"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { exchangeGoogleCode } from "@/lib/platforms/youtube";

export default function GoogleCallback({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(searchParams);
  const code = typeof params.code === "string" ? params.code : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Connecting to YouTube Music...");

  useEffect(() => {
    if (error) {
      setStatus("error");
      setMessage(`Google authorization failed: ${error}`);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No authorization code received from Google.");
      return;
    }

    exchangeGoogleCode(code)
      .then(() => {
        setStatus("success");
        setMessage("Connected to YouTube Music! Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Failed to complete Google authorization."
        );
      });
  }, [code, error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050507]">
      <div className="text-center">
        {status === "loading" && (
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
        )}
        {status === "success" && (
          <div className="mb-4 text-3xl">&#10003;</div>
        )}
        {status === "error" && (
          <div className="mb-4 text-3xl text-red-500">&#10007;</div>
        )}
        <p className="text-white text-lg">{message}</p>
        {status === "error" && (
          <a href="/" className="mt-4 inline-block text-sm text-gray-400 underline">
            Return to Zeeky
          </a>
        )}
      </div>
    </div>
  );
}
