"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Bot,
  Shield,
  Zap,
  RefreshCw,
  Sun,
  Search,
  BarChart3,
  Sprout,
  Sparkles,
  Brain,
  Bell,
  Lock,
  Puzzle,
  ArrowRight,
  Github,
} from "lucide-react";
import { agentTemplates } from "@/shared/data/templates";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  RefreshCw,
  Sun,
  Search,
  BarChart3,
  Sprout,
  Sparkles,
};

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GradientOrb() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.22 280), oklch(0.55 0.2 250), transparent)",
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 60, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.18 220), oklch(0.5 0.15 190), transparent)",
        }}
        animate={{
          x: [0, -80, 40, 0],
          y: [0, 60, -40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage:
          "radial-gradient(circle, oklch(0.985 0 0) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}

export default function LandingPage() {
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      // Don't redirect — let users see landing page even if logged in
    }
  }, []);

  return (
    <div className="min-h-screen relative">
      <GridPattern />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <span className="text-lg font-bold bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Foundry of Agents
        </span>
        <Link
          href="/auth/login"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative py-24 md:py-36 px-6">
        <GradientOrb />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Your AI Agents.
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Your Crypto.
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Your Rules.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Deploy autonomous AI agents that manage your crypto portfolio,
              execute trades, and send you daily briefings — all with guardrails
              you control.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/login"
                className="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/onboarding"
                className="rounded-lg border border-border px-8 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
              >
                View Demo
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              How It Works
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                step: "01",
                title: "Deploy an Agent",
                desc: "Choose a template or build custom. Set instructions, model, and personality.",
              },
              {
                icon: Shield,
                step: "02",
                title: "Set Guardrails",
                desc: "Define wallet limits, approved tokens, active hours. The policy engine enforces them — the AI can't override.",
              },
              {
                icon: Zap,
                step: "03",
                title: "Let It Execute",
                desc: "Your agent trades, researches, and briefs you 24/7. You stay in control via Telegram alerts.",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div className="rounded-xl border border-border bg-card/50 p-8 text-center hover:border-primary/30 transition-colors">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-5">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mb-2">
                    STEP {item.step}
                  </p>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Templates */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Agent Templates
            </h2>
            <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
              Start with a pre-built template or create something entirely new.
            </p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentTemplates.map((tpl, i) => {
              const Icon = iconMap[tpl.icon] || Sparkles;
              return (
                <FadeIn key={tpl.id} delay={i * 0.08}>
                  <Link
                    href={`/onboarding?template=${tpl.id}`}
                    className="group block rounded-xl border border-border bg-card/50 p-6 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_oklch(0.65_0.22_280_/_0.15)] transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{tpl.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tpl.description}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-4 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Get started <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Built for Serious Operators
            </h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: Brain,
                title: "Agents that learn",
                desc: "Three-layer memory system. Your agent remembers preferences, facts, and conversation context across sessions.",
              },
              {
                icon: Bell,
                title: "Proactive alerts",
                desc: "Telegram, Discord, or email. Get briefed on trades, market moves, and portfolio changes.",
              },
              {
                icon: Lock,
                title: "Vault-grade security",
                desc: "Keys never leave the vault. Deterministic policy engine. Complete audit trail.",
              },
              {
                icon: Puzzle,
                title: "Infinitely extensible",
                desc: "Add capabilities without code changes. Skills are content, not endpoints.",
              },
            ].map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.1}>
                <div className="rounded-xl border border-border bg-card/50 p-8 hover:border-primary/30 transition-colors">
                  <feat.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-24 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to deploy your first agent?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join the next generation of crypto-native AI operations.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>TenX Protocols &copy; 2026</span>
          <span>Built on Solana</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
