import type { Metadata } from "next";
import "./globals.css";
import { SolanaWalletProvider } from "@/shared/providers/wallet-provider";

export const metadata: Metadata = {
  title: "Foundry — Build Your AI Army",
  description:
    "Deploy autonomous AI agents that manage your crypto portfolio, execute trades, and send daily briefings — with guardrails you control.",
  openGraph: {
    title: "Foundry of Agents",
    description: "Your AI Agents. Your Crypto. Your Rules.",
    type: "website",
    url: "https://forge-of-agents.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Foundry of Agents",
    description:
      "Deploy autonomous AI agents for crypto. Built on Solana.",
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </body>
    </html>
  );
}
