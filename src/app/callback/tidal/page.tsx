"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { exchangeTidalCode } from "@/lib/platforms/tidal";

export default function TidalCallback({
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
  const [message, setMessage] = useState("Connecting to Tidal...");

  useEffect(() => {
    if (error) {
      setStatus("error");
      setMessage(`Tidal authorization failed: ${error}`);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No authorization code received from Tidal.");
      return;
    }

    exchangeTidalCode(code)
      .then(() => {
        setStatus("success");
        setMessage("Connected to Tidal! Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Failed to complete Tidal authorization."
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
