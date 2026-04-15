"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/store";

export default function SupabaseCallbackPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase puts tokens in the URL hash: #access_token=...&refresh_token=...
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (!accessToken) {
      setError("No access token found. The magic link may have expired.");
      return;
    }

    // Exchange Supabase token for our JWT
    api
      .post<{
        token: string;
        user: { id: string; email: string };
        workspace: { id: string };
      }>("/api/auth/supabase-verify", { access_token: accessToken })
      .then((res) => {
        localStorage.setItem("token", res.token);
        login(res.token, {
          id: res.user.id,
          email: res.user.email,
          name: res.user.email.split("@")[0],
        });
        router.replace("/dashboard/canvas");
      })
      .catch((err) => {
        setError(err.message || "Authentication failed. Please try again.");
      });
  }, [router, login]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-border bg-card p-8 text-center max-w-sm">
          <h2 className="text-lg font-semibold text-red-400">
            Authentication Failed
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
