import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foundry of Agents | Crypto-Native AI Agent Platform",
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
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
