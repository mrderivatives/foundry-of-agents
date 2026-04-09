"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/store";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing token");
      return;
    }

    api
      .post<{
        token: string;
        user: { id: string; email: string };
        workspace: { id: string };
      }>("/api/auth/verify", { token })
      .then((res) => {
        localStorage.setItem("token", res.token);
        login(res.token, {
          id: res.user.id,
          email: res.user.email,
          name: res.user.email,
        });
        router.replace("/dashboard");
      })
      .catch((err) => {
        setError(err.message || "Verification failed");
      });
  }, [searchParams, router, login]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-border bg-card p-8 text-center max-w-sm">
          <h2 className="text-lg font-semibold text-red-400">
            Verification Failed
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
        <p className="text-sm text-muted-foreground">Verifying...</p>
      </div>
    </div>
  );
}
