import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foundry of Agents",
  description: "SwarmForge v3 — Crypto-native AI Agent OS",
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
