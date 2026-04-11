"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TEAMS } from "@/shared/data/teams";
import { getCharacter } from "@/shared/components/characters";
import { GlassCard } from "@/shared/components/glass-card";

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
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function TeamShowcaseCard({ team }: { team: (typeof TEAMS)[number] }) {
  const leadChar = getCharacter(team.lead.characterId);
  const specChars = team.specialists.map((s) => ({
    Component: getCharacter(s.characterId),
    name: s.name,
  }));

  return (
    <GlassCard className="flex-shrink-0 w-[200px] p-6 cursor-pointer">
      <div className="text-2xl mb-3">{team.emoji}</div>
      <h3 className="font-semibold text-sm text-[#fafafa] mb-1">{team.name}</h3>
      <div className="flex items-center gap-2 my-4">
        {leadChar && (
          <div
            className="rounded-full p-0.5"
            style={{ border: `2px solid ${team.accentColor}` }}
          >
            {(() => {
              const C = leadChar;
              return <C size={32} />;
            })()}
          </div>
        )}
        {specChars.map(
          (sc, i) =>
            sc.Component && (
              <div key={i} className="rounded-full p-0.5 border border-white/[0.06]">
                {(() => {
                  const C = sc.Component;
                  return <C size={32} />;
                })()}
              </div>
            )
        )}
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
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
        {/* Subtle mesh gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/[0.07] blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/[0.05] blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-[clamp(48px,6vw,80px)] font-light tracking-[-0.03em] leading-[1.05]"
            style={{
              background: "linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            Build Your AI Army
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-[#a1a1aa] max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
          >
            The agents that trade, research, and plan — while you live your life.
          </motion.p>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
          >
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#22c55e] text-white font-medium text-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{
                boxShadow: "0 0 32px rgba(34,197,94,0.3)",
              }}
            >
              Assemble Your Team
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.p
            className="mt-6 text-sm text-[#71717a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45, ease }}
          >
            8,247 teams deployed · Free to start
          </motion.p>
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

          <div className="grid md:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <GlassCard className="p-8" hover={false}>
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-lg font-medium text-[#fafafa] mb-3">
                  Make Money While You Sleep
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6">
                  Your team of AI agents monitors markets 24/7, executes trades
                  at the optimal moment, and catches opportunities you&apos;d miss.
                </p>
                <div className="rounded-lg p-4 bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-sm text-[#a1a1aa] italic">
                    &ldquo;Foundry&apos;s DCA bot caught the March dip at $88 SOL.
                    I was sleeping.&rdquo;
                  </p>
                  <p className="text-xs text-[#71717a] mt-2">— @early_user</p>
                </div>
              </GlassCard>
            </FadeIn>

            <FadeIn delay={0.2}>
              <GlassCard className="p-8" hover={false}>
                <div className="text-3xl mb-4">🛡️</div>
                <h3 className="text-lg font-medium text-[#fafafa] mb-3">
                  Don&apos;t Get Replaced — Lead It
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6">
                  Everyone&apos;s hiring AI. The question isn&apos;t whether AI replaces
                  your job — it&apos;s whether you&apos;re the one leading it.
                </p>
                <div className="rounded-lg p-4 bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-sm text-[#a1a1aa] italic">
                    &ldquo;I run a 4-agent team that does the research output of
                    3 analysts. My boss thinks I&apos;m magic.&rdquo;
                  </p>
                  <p className="text-xs text-[#71717a] mt-2">— @anon_user</p>
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
            <div className="flex gap-4 overflow-x-auto pb-4 justify-center flex-wrap">
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

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: "01",
                title: "Pick Your Team",
                desc: "Choose a pre-built squad or mix your own from 16+ specialist agents.",
              },
              {
                num: "02",
                title: "Activate",
                desc: "Your agents go live. Watch them coordinate in real-time.",
              },
              {
                num: "03",
                title: "Sit Back",
                desc: "They research, trade, monitor, and report back — 24/7.",
              },
            ].map((item, i) => (
              <FadeIn key={item.num} delay={i * 0.15}>
                <div className="text-center">
                  <div className="text-sm font-mono text-[#7c3aed] mb-4">
                    {item.num}
                  </div>
                  <h3 className="text-lg font-medium text-[#fafafa] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">
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
          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-12 mb-16">
              {[
                { number: "8,247", label: "Teams" },
                { number: "47,000+", label: "Tasks" },
                { number: "$2.4M", label: "Executed" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-light text-[#fafafa] tracking-tight">
                    {stat.number}
                  </div>
                  <div className="text-xs text-[#71717a] mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

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
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#22c55e] text-white font-medium text-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{
                boxShadow: "0 0 32px rgba(34,197,94,0.3)",
              }}
            >
              Assemble Your Team
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#71717a]">
          <span>TenX Protocols (TSX-V: TNX) &copy; 2026</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#a1a1aa] cursor-pointer transition-colors duration-200">About</span>
            <span className="hover:text-[#a1a1aa] cursor-pointer transition-colors duration-200">Docs</span>
            <span className="hover:text-[#a1a1aa] cursor-pointer transition-colors duration-200">Terms</span>
            <span className="hover:text-[#a1a1aa] cursor-pointer transition-colors duration-200">X/Twitter</span>
            <span className="hover:text-[#a1a1aa] cursor-pointer transition-colors duration-200">Discord</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
