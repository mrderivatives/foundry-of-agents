import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ['latin'], display: 'swap', weight: ['200','300','400','500','600'] });
import { SolanaWalletProvider } from "@/shared/providers/wallet-provider";

export const metadata: Metadata = {
  title: "Foundry — Build Your AI Army",
  description:
    "Deploy autonomous AI agents that manage your crypto portfolio, execute trades, and send daily briefings — with guardrails you control.",
  openGraph: {
    title: "Foundry of Agents",
    description: "Your AI Agents. Your Crypto. Your Rules.",
    type: "website",
    url: "https://agentforge.systems",
  },
  twitter: {
    card: "summary_large_image",
    title: "Foundry of Agents",
    description:
      "Deploy autonomous AI agents for crypto. Built on Solana.",
  },
  icons: {
    icon: [{ url: "/flame-64.png", type: "image/png" }],
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

      </head>
      <body className={`min-h-screen antialiased ${inter.className}`}>
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </body>
    </html>
  );
}
