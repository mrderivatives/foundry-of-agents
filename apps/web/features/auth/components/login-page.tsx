"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/store";
import bs58 from "bs58";

export function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { publicKey, signMessage, connected } = useWallet();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  const handleWalletAuth = useCallback(async () => {
    if (!publicKey || !signMessage) return;
    setWalletLoading(true);
    setError(null);
    try {
      const message = `Sign in to Foundry of Agents\nTimestamp: ${Date.now()}`;
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      const sigBase58 = bs58.encode(signature);

      const res = await api.post<{ token: string; user: { id: string; wallet_address?: string } }>(
        "/api/auth/siws",
        {
          message,
          signature: sigBase58,
          publicKey: publicKey.toBase58(),
        }
      );
      localStorage.setItem("token", res.token);
      login(res.token, {
        id: res.user.id,
        email: res.user.wallet_address || publicKey.toBase58(),
        name: publicKey.toBase58().slice(0, 8),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet authentication failed");
    } finally {
      setWalletLoading(false);
    }
  }, [publicKey, signMessage, login, router]);

  useEffect(() => {
    if (connected && publicKey && signMessage) {
      handleWalletAuth();
    }
  }, [connected, publicKey, signMessage, handleWalletAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/magic-link", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-border bg-card p-8 text-center max-w-sm">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a magic link to {email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email to get a magic link
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <WalletMultiButton
            style={{
              width: "100%",
              justifyContent: "center",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              height: "2.5rem",
              backgroundColor: "hsl(var(--secondary))",
              color: "hsl(var(--foreground))",
            }}
          />
          {walletLoading && (
            <p className="text-xs text-muted-foreground">Authenticating wallet...</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
