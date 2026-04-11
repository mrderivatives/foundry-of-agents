"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TEAMS } from "@/shared/data/teams";
import { getCharacter } from "@/shared/components/characters";

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

function FloatingCharacter({
  characterId,
  x,
  y,
  delay,
  size,
}: {
  characterId: string;
  x: string;
  y: string;
  delay: number;
  size: number;
}) {
  const Character = getCharacter(characterId);
  if (!Character) return null;

  return (
    <motion.div
      className="absolute opacity-[0.12] pointer-events-none"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -15, 5, -10, 0],
        x: [0, 5, -5, 3, 0],
      }}
      transition={{
        duration: 12 + delay * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Character size={size} />
    </motion.div>
  );
}

function ParticleGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(34,197,94,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <motion.div
        className="absolute -top-1/4 left-1/4 w-[900px] h-[900px] rounded-full opacity-15 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(34,197,94,0.4), rgba(16,185,129,0.2), transparent)",
        }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-10 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.3), rgba(59,130,246,0.15), transparent)",
        }}
        animate={{
          x: [0, -60, 30, 0],
          y: [0, 40, -30, 0],
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

function TeamShowcaseCard({ team }: { team: (typeof TEAMS)[number] }) {
  const leadChar = getCharacter(team.lead.characterId);
  const specChars = team.specialists.map((s) => ({
    Component: getCharacter(s.characterId),
    name: s.name,
  }));

  return (
    <motion.div
      className="group relative flex-shrink-0 w-[220px] rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: `0 0 0 1px transparent`,
      }}
      whileHover={{
        boxShadow: `0 0 30px -5px ${team.accentColor}33, 0 0 0 1px ${team.accentColor}44`,
      }}
    >
      <div className="text-3xl mb-2">{team.emoji}</div>
      <h3 className="font-bold text-sm text-white mb-1">{team.name}</h3>
      <div className="flex items-center gap-1 my-3">
        {leadChar && (
          <div
            className="rounded-full p-0.5"
            style={{ border: `2px solid ${team.accentColor}` }}
          >
            {(() => {
              const C = leadChar;
              return <C size={36} />;
            })()}
          </div>
        )}
        {specChars.map(
          (sc, i) =>
            sc.Component && (
              <div key={i} className="rounded-full p-0.5 border border-white/10">
                {(() => {
                  const C = sc.Component;
                  return <C size={36} />;
                })()}
              </div>
            )
        )}
        {team.id === "custom" && (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[40px] h-[40px] rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 text-sm font-bold"
              >
                ?
              </div>
            ))}
          </>
        )}
      </div>
      <p className="text-xs text-white/50 leading-relaxed">{team.vibe}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen relative" style={{ background: "#0a0a0f" }}>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col">
        <ParticleGrid />

        {/* Floating character silhouettes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingCharacter characterId="coach" x="8%" y="20%" delay={0} size={100} />
          <FloatingCharacter characterId="managing-director" x="78%" y="15%" delay={1.5} size={90} />
          <FloatingCharacter characterId="chief-of-staff" x="15%" y="60%" delay={3} size={80} />
          <FloatingCharacter characterId="product-chief" x="82%" y="55%" delay={2} size={85} />
          <FloatingCharacter characterId="default-lead" x="50%" y="75%" delay={4} size={70} />
        </div>

        {/* Nav - fades in on scroll */}
        <motion.nav
          style={{ opacity: heroOpacity }}
          className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-5 max-w-7xl mx-auto w-full"
        >
          <span className="text-lg font-bold text-white">
            Foundry
          </span>
          <Link
            href="/auth/login"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            Sign In
          </Link>
        </motion.nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
                <span className="text-white">BUILD YOUR</span>
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #22c55e, #10b981, #06b6d4)",
                  }}
                >
                  AI ARMY
                </span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                The agents that trade, research, and plan
                <br className="hidden sm:block" />
                — while you live your life.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-10">
                <Link
                  href="/teams"
                  className="group relative inline-flex items-center gap-2 rounded-xl px-10 py-4 text-base font-bold text-white transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #22c55e, #16a34a)",
                    boxShadow:
                      "0 0 40px -5px rgba(34,197,94,0.4), 0 0 80px -10px rgba(34,197,94,0.2)",
                  }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #22c55e, #16a34a)",
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 20px 0px rgba(34,197,94,0.3)",
                        "0 0 40px 5px rgba(34,197,94,0.5)",
                        "0 0 20px 0px rgba(34,197,94,0.3)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    ASSEMBLE YOUR TEAM
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.45}>
              <p className="mt-6 text-sm text-white/30">
                8,247 teams deployed · Free to start
              </p>
            </FadeIn>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-2 rounded-full bg-white/40"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Two Hooks */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-4">
              WHY AN AI ARMY?
            </h2>
            <p className="text-center text-white/40 mb-14 max-w-xl mx-auto">
              Two reasons people build teams. Which one are you?
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Money Hook */}
            <FadeIn delay={0.1}>
              <div
                className="rounded-2xl p-8 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.03))",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  MAKE MONEY WHILE YOU SLEEP
                </h3>
                <p className="text-white/50 leading-relaxed mb-6">
                  Your team of AI agents monitors markets 24/7, executes trades
                  at the optimal moment, and catches opportunities you&apos;d miss
                  asleep.
                </p>
                <div
                  className="rounded-xl p-4"
                  style={{ background: "rgba(245,158,11,0.06)" }}
                >
                  <p className="text-sm text-white/60 italic">
                    &ldquo;Foundry&apos;s DCA bot caught the March dip at $88 SOL.
                    I was sleeping.&rdquo;
                  </p>
                  <p className="text-xs text-white/30 mt-2">— @early_user</p>
                </div>
              </div>
            </FadeIn>

            {/* Career Hook */}
            <FadeIn delay={0.2}>
              <div
                className="rounded-2xl p-8 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  DON&apos;T GET REPLACED BY AI — LEAD IT
                </h3>
                <p className="text-white/50 leading-relaxed mb-6">
                  Everyone&apos;s hiring AI. The question isn&apos;t whether AI replaces
                  your job — it&apos;s whether you&apos;re the one leading the AI or the
                  one being replaced by it.
                </p>
                <div
                  className="rounded-xl p-4"
                  style={{ background: "rgba(99,102,241,0.06)" }}
                >
                  <p className="text-sm text-white/60 italic">
                    &ldquo;I run a 4-agent team that does the research output of
                    3 analysts. My boss thinks I&apos;m magic.&rdquo;
                  </p>
                  <p className="text-xs text-white/30 mt-2">— @anon_user</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Team Showcase */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-14">
              CHOOSE YOUR SQUAD
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
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-16">
              HOW IT WORKS
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "①",
                title: "PICK YOUR TEAM",
                desc: "Choose a pre-built squad or mix your own from 16+ specialist agents.",
                time: "30 seconds",
                color: "#22c55e",
              },
              {
                step: "②",
                title: "ACTIVATE",
                desc: "Your agents go live. Watch them start working in real-time.",
                time: "60 seconds",
                color: "#3b82f6",
              },
              {
                step: "③",
                title: "SIT BACK",
                desc: "They research, trade, monitor, and report back — 24/7.",
                time: "Forever",
                color: "#8b5cf6",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.15}>
                <div className="text-center">
                  <div
                    className="text-5xl font-bold mb-4"
                    style={{ color: item.color }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    {item.desc}
                  </p>
                  <div
                    className="inline-block rounded-full px-4 py-1.5 text-xs font-bold"
                    style={{
                      color: item.color,
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    {item.time}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mb-16">
              {[
                { number: "8,247", label: "TEAMS" },
                { number: "47,000+", label: "TASKS" },
                { number: "$2.4M", label: "EXECUTED" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    {stat.number}
                  </div>
                  <div className="text-xs text-white/30 font-bold tracking-widest mt-1">
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
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <p className="text-sm text-white/60 italic leading-relaxed">
                    &ldquo;{quote}&rdquo;
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
              READY TO BUILD YOUR TEAM?
            </h2>
            <p className="text-white/40 mb-10 max-w-md mx-auto">
              Join thousands of operators who let AI do the heavy lifting.
            </p>
            <Link
              href="/teams"
              className="group relative inline-flex items-center gap-2 rounded-xl px-10 py-4 text-base font-bold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                boxShadow:
                  "0 0 40px -5px rgba(34,197,94,0.4), 0 0 80px -10px rgba(34,197,94,0.2)",
              }}
            >
              ASSEMBLE YOUR TEAM
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <span>TenX Protocols (TSX-V: TNX) &copy; 2026</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-white/60 cursor-pointer transition-colors">About</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors">Docs</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors">X/Twitter</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors">Discord</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
