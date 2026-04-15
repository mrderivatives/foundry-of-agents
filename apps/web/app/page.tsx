"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Coins, Shield, Brain, Bell, Lock, Puzzle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ForgeFlame } from "@/shared/components/forge-flame";
import { TEAMS } from "@/shared/data/teams";
import { CharacterAvatar } from "@/shared/components/characters";
import { GlassCard } from "@/shared/components/glass-card";
import { TeamIcon } from "@/shared/components/team-icon";

function FeatureIcon({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  return (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
         style={{ background: color + '15', border: `1px solid ${color}30` }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
  );
}

function GradientOrbs() {
  return (
    <>
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/[0.04] blur-[120px]"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          opacity: [0.03, 0.05, 0.03],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/[0.03] blur-[100px]"
        animate={{
          x: [0, -30, 25, 0],
          y: [0, 20, -25, 0],
          opacity: [0.03, 0.05, 0.03],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-emerald-600/[0.02] blur-[80px]"
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -15, 30, 0],
          opacity: [0.02, 0.04, 0.02],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

const ease = [0.16, 1, 0.3, 1] as const;

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
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function TeamShowcaseCard({ team }: { team: (typeof TEAMS)[number] }) {
  return (
    <GlassCard className="flex-shrink-0 w-[200px] p-7 cursor-pointer" style={{ borderLeft: `2px solid ${team.accentColor}30` }}>
      <div className="mb-3"><TeamIcon teamId={team.id} size="md" /></div>
      <h3 className="font-medium text-sm text-[#fafafa] mb-1">{team.name}</h3>
      <div className="flex items-center justify-center gap-3 my-4">
        <CharacterAvatar
          characterId={team.lead.characterId}
          size={36}
          accentColor={team.accentColor}
        />
        {team.specialists.map((spec) => (
          <CharacterAvatar
            key={spec.id}
            characterId={spec.characterId}
            size={36}
            accentColor={team.accentColor}
          />
        ))}
        {team.id === "custom" && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[36px] h-[36px] rounded-full border-2 border-dashed border-white/[0.15] flex items-center justify-center text-[#71717a] text-xs"
              >
                ?
              </div>
            ))}
          </>
        )}
      </div>
      <p className="text-xs text-[#71717a] leading-relaxed">{team.vibe}</p>
    </GlassCard>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-start justify-center px-6 pt-24 pb-32">
        {/* Hero background — extends beyond hero into team showcase */}
        <div className="absolute inset-0 h-[150vh] overflow-hidden">
          <Image src="/hero-bg-network-complex.png" alt="" fill className="object-cover opacity-[0.12] scale-110" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-transparent to-[#09090b]" />
          <div className="absolute bottom-0 h-64 w-full bg-gradient-to-t from-[#09090b] to-transparent" />
        </div>

        {/* Slow-moving gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <GradientOrbs />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease }}
          >
            <ForgeFlame width={280} height={224} interactive={true} />
          </motion.div>

          <motion.h1
            className="text-[clamp(32px,6vw,72px)] font-extralight tracking-[-0.03em] leading-[1.05]"
            style={{
              background: "linear-gradient(135deg, #fff 0%, #7c3aed 50%, rgba(255,255,255,0.4) 100%)",
              backgroundSize: "200% 200%",
              animation: "gradient-shift 8s ease infinite",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            Agent Forge
          </motion.h1>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
          >
            <p className="text-lg text-[#a1a1aa] leading-loose">A team of AI agents.</p>
            <p className="text-lg text-[#a1a1aa] leading-loose">Working for you.</p>
            <p className="text-lg text-[#a1a1aa] leading-loose">24 hours a day.</p>
          </motion.div>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
          >
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-violet-500/50 bg-violet-500/10 text-white font-medium text-lg hover:bg-violet-500/20 hover:border-violet-500/70 transition-all duration-200"
            >
              Assemble Your Team
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Character showcase row below CTA */}
          <motion.div
            className="mt-12 flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
          >
            {['coach', 'managing-director', 'analyst', 'trader', 'cto'].map(id => (
              <CharacterAvatar key={id} characterId={id} size={56} accentColor="#7c3aed" />
            ))}
          </motion.div>

          <motion.div
            className="mt-8 flex items-center justify-center gap-3 text-2xl font-light text-[#a1a1aa]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45, ease }}
          >
            <span>8,247 teams</span>
            <span className="text-[#52525b]">·</span>
            <span>47K+ tasks</span>
            <span className="text-[#52525b]">·</span>
            <span>Free to start</span>
          </motion.div>
        </div>
      </section>

      {/* Two Hooks */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2
              className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em] text-center mb-4"
              style={{
                background: "linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Why an AI Army?
            </h2>
            <p className="text-center text-[#71717a] mb-16 max-w-md mx-auto">
              Two reasons people build teams. Which one are you?
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 max-w-xl md:max-w-none mx-auto">
            <FadeIn delay={0.1}>
              <GlassCard className="p-8 max-w-xl mx-auto" hover={false}>
                <div className="mb-4"><FeatureIcon icon={Coins} color="#f59e0b" /></div>
                <h3 className="text-lg font-medium text-[#fafafa] mb-3">
                  Make Money While You Sleep
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6">
                  Your team of AI agents monitors markets 24/7, executes trades
                  at the optimal moment, and catches opportunities you&apos;d miss.
                </p>
                <div className="rounded-lg p-4 bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-sm text-[#71717a] italic">
                    &ldquo;Foundry&apos;s DCA bot caught the March dip at $88 SOL.
                    I was sleeping.&rdquo;
                  </p>
                  <p className="text-xs text-[#52525b] mt-2">— @early_user</p>
                </div>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.2}>
              <GlassCard className="p-8 max-w-xl mx-auto" hover={false}>
                <div className="mb-4"><FeatureIcon icon={Shield} color="#3b82f6" /></div>
                <h3 className="text-lg font-medium text-[#fafafa] mb-3">
                  Don&apos;t Get Replaced — Lead It
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6">
                  Everyone&apos;s hiring AI. The question isn&apos;t whether AI replaces
                  your job — it&apos;s whether you&apos;re the one leading it.
                </p>
                <div className="rounded-lg p-4 bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-sm text-[#71717a] italic">
                    &ldquo;I run a 4-agent team that does the research output of
                    3 analysts. My boss thinks I&apos;m magic.&rdquo;
                  </p>
                  <p className="text-xs text-[#52525b] mt-2">— @anon_user</p>
                </div>
              </GlassCard>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Team Showcase */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2
              className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em] text-center mb-16"
              style={{
                background: "linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Choose Your Squad
            </h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex gap-6 overflow-x-auto pb-4 justify-center flex-wrap">
              {TEAMS.map((team) => (
                <TeamShowcaseCard key={team.id} team={team} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2
              className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em] text-center mb-20"
              style={{
                background: "linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              How It Works
            </h2>
          </FadeIn>

          <div className="flex flex-col md:flex-row gap-12 md:gap-16 max-w-4xl mx-auto">
            {[
              {
                num: "1",
                title: "Choose Your Mission",
                desc: "Pick a team template or build your own from 16+ specialists.",
              },
              {
                num: "2",
                title: "Assemble Your Team",
                desc: "Name your agents. Set their roles. One click to deploy.",
              },
              {
                num: "3",
                title: "Watch Them Work",
                desc: "Your team researches, trades, and reports back — 24/7.",
              },
            ].map((item, i) => (
              <FadeIn key={item.num} delay={i * 0.15}>
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4 text-lg font-light text-[#a1a1aa]">
                    {item.num}
                  </div>
                  <h3 className="text-lg font-light mb-2">{item.title}</h3>
                  <p className="text-sm text-[#71717a] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              "I replaced 3 hours of morning research with one agent team.",
              "My DCA bot hasn't missed a week in 4 months.",
              "I showed my boss my AI team's output. Got promoted.",
            ].map((quote, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <GlassCard className="p-6" hover={false}>
                  <p className="text-sm text-[#a1a1aa] italic leading-relaxed">
                    &ldquo;{quote}&rdquo;
                  </p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-[clamp(28px,4vw,48px)] font-light tracking-[-0.02em] mb-6"
              style={{
                background: "linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Ready to Build Your Team?
            </h2>
            <p className="text-[#71717a] mb-10 max-w-md mx-auto">
              Join thousands of operators who let AI do the heavy lifting.
            </p>
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-violet-500/50 bg-violet-500/10 text-white font-medium text-lg hover:bg-violet-500/20 hover:border-violet-500/70 transition-all duration-200"
            >
              Assemble Your Team
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#52525b]">
          <span>TenX Protocols (TSX-V: TNX) &copy; 2026</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#71717a] cursor-pointer transition-colors duration-200">About</span>
            <span className="hover:text-[#71717a] cursor-pointer transition-colors duration-200">Docs</span>
            <span className="hover:text-[#71717a] cursor-pointer transition-colors duration-200">Terms</span>
            <span className="hover:text-[#71717a] cursor-pointer transition-colors duration-200">X/Twitter</span>
            <span className="hover:text-[#71717a] cursor-pointer transition-colors duration-200">Discord</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
