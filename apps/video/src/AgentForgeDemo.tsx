import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Search, BarChart3, Zap, CheckCircle2, Brain, Shield, Bell, Lock,
} from "lucide-react";

const C = {
  bg: "#09090b",
  text: "#fafafa",
  muted: "#a1a1aa",
  dim: "#71717a",
  violet: "#7c3aed",
  violetLight: "#a78bfa",
  green: "#22c55e",
  emerald: "#10b981",
  blue: "#3b82f6",
  amber: "#f59e0b",
};

const center: React.CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  height: "100%", width: "100%",
};

// ─── Reusable Animations ───

function SnapText({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 200 } });
  return (
    <div style={{
      opacity: Math.min(s * 2, 1),
      transform: `scale(${0.95 + s * 0.05})`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SlideIn({ children, from = "right", delay = 0, style }: { children: React.ReactNode; from?: "left" | "right" | "bottom"; delay?: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 120 } });
  const axis = from === "bottom" ? "Y" : "X";
  const dir = from === "left" ? -1 : 1;
  const dist = from === "bottom" ? 80 : 120;
  return (
    <div style={{ transform: `translate${axis}(${(1 - s) * dist * dir}px)`, opacity: s, ...style }}>
      {children}
    </div>
  );
}

function WordReveal({ text, style, startDelay = 0, perWord = 6 }: { text: string; style?: React.CSSProperties; startDelay?: number; perWord?: number }) {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0 16px", justifyContent: "center", ...style }}>
      {words.map((w, i) => {
        const d = startDelay + i * perWord;
        const opacity = interpolate(frame, [d, d + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const y = interpolate(frame, [d, d + 4], [8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <span key={i} style={{ opacity, transform: `translateY(${y}px)`, display: "inline-block" }}>{w}</span>;
      })}
    </div>
  );
}

function CountUp({ target, suffix = "", duration = 20, style }: { target: number; suffix?: string; duration?: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const val = Math.round(interpolate(frame, [0, duration], [0, target], { extrapolateRight: "clamp" }));
  return <span style={style}>{val.toLocaleString()}{suffix}</span>;
}

function MockupImg({ src, style }: { src: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <div style={{ position: "absolute", inset: -20, background: `radial-gradient(ellipse, ${C.violet}15 0%, transparent 70%)`, filter: "blur(40px)" }} />
      <Img src={staticFile(src)} style={{ position: "relative", width: "100%", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
    </div>
  );
}

function CharCircle({ src, size = 80, glow = C.violet, delay = 0 }: { src: string; size?: number; glow?: string; delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 100 } });
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      border: "2px solid rgba(255,255,255,0.15)", boxShadow: `0 0 ${size / 3}px ${glow}50`,
      transform: `scale(${s})`, opacity: s, flexShrink: 0,
    }}>
      <Img src={staticFile(src)} style={{ width: size, height: size, objectFit: "cover" }} />
    </div>
  );
}

// ─── SCENES ───

// Scene 01: Cold open on product (0-3s = 0-90)
function S01() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ ...center, padding: "60px 120px" }}>
        <SlideIn from="bottom" delay={5}>
          <MockupImg src="product-mockup-dashboard.png" style={{ maxWidth: 1200 }} />
        </SlideIn>
      </div>
    </AbsoluteFill>
  );
}

// Scene 02: "THE FUTURE OF WORK" (3-5s = 90-150)
function S02() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        <WordReveal text="THE FUTURE OF WORK" style={{ fontSize: 72, fontWeight: 200, color: C.text, letterSpacing: "-0.03em" }} />
      </div>
    </AbsoluteFill>
  );
}

// Scene 03: "IS NOT ONE AI" (5-7s = 150-210)
function S03() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        <SnapText style={{ fontSize: 72, fontWeight: 200, color: C.muted, letterSpacing: "-0.03em" }}>
          IS NOT ONE AI
        </SnapText>
      </div>
    </AbsoluteFill>
  );
}

// Scene 04: "IT'S AN ARMY" (7-9s = 210-270)
function S04() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        <SnapText style={{
          fontSize: 96, fontWeight: 300, letterSpacing: "-0.03em",
          background: `linear-gradient(135deg, ${C.text}, ${C.violetLight})`,
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          IT'S AN ARMY
        </SnapText>
      </div>
    </AbsoluteFill>
  );
}

// Scene 05: Assembly mockup (9-12s = 270-360)
function S05() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ ...center, padding: "40px 120px" }}>
        <SlideIn from="bottom" delay={5}>
          <MockupImg src="product-mockup-assembly.png" style={{ maxWidth: 1100 }} />
        </SlideIn>
        <SnapText delay={25} style={{ fontSize: 24, color: C.muted, fontWeight: 300, marginTop: 32 }}>
          Choose your team. Name your agents. One click to deploy.
        </SnapText>
      </div>
    </AbsoluteFill>
  );
}

// Scene 06: "3 MINUTES TO DEPLOY" (12-14s = 360-420)
function S06() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        <div style={{ fontSize: 120, fontWeight: 200, color: C.green, letterSpacing: "-0.03em" }}>
          <CountUp target={3} duration={15} />
        </div>
        <SnapText delay={10} style={{ fontSize: 36, fontWeight: 200, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
          Minutes to Deploy
        </SnapText>
      </div>
    </AbsoluteFill>
  );
}

// Scene 07-09: RESEARCH / TRADE / ANALYZE with character (14-20s = 420-600)
function SCharacterVerb({ verb, src, glow }: { verb: string; src: string; glow: string }) {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ ...center, flexDirection: "row", gap: 48 }}>
        <CharCircle src={src} size={120} glow={glow} delay={3} />
        <SnapText delay={5} style={{ fontSize: 80, fontWeight: 200, color: C.text, letterSpacing: "-0.03em" }}>
          {verb}
        </SnapText>
      </div>
    </AbsoluteFill>
  );
}

// Scene 10: "24/7" all three (20-22s = 600-660)
function S10() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
          <CharCircle src="characters/char-analyst.png" size={80} glow={C.emerald} delay={0} />
          <CharCircle src="characters/char-quant.png" size={80} glow={C.blue} delay={5} />
          <CharCircle src="characters/char-trader.png" size={80} glow={C.green} delay={10} />
        </div>
        <SnapText delay={12} style={{ fontSize: 96, fontWeight: 200, color: C.violetLight, letterSpacing: "-0.02em" }}>
          24 / 7
        </SnapText>
      </div>
    </AbsoluteFill>
  );
}

// Scene 11: Dashboard full screen (22-26s = 660-780)
function S11() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ ...center, padding: "40px 80px" }}>
        <SlideIn from="bottom" delay={3}>
          <MockupImg src="product-mockup-dashboard.png" style={{ maxWidth: 1400 }} />
        </SlideIn>
      </div>
    </AbsoluteFill>
  );
}

// Scene 12: Activity event close-up (26-28s = 780-840)
function S12() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        <SlideIn from="right" delay={3}>
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "24px 40px", borderLeft: `3px solid ${C.emerald}`,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <CheckCircle2 size={28} color={C.emerald} strokeWidth={1.5} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 500, color: C.emerald }}>Atlas</div>
              <div style={{ fontSize: 18, color: C.muted }}>SOL analysis complete — bullish signal detected</div>
            </div>
          </div>
        </SlideIn>
      </div>
    </AbsoluteFill>
  );
}

// Scene 13: Wallet card (28-30s = 840-900)
function S13() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        <SlideIn from="left" delay={3}>
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "24px 40px", borderLeft: `3px solid ${C.green}`,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <Shield size={28} color={C.green} strokeWidth={1.5} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 500, color: C.green }}>Swap Executed</div>
              <div style={{ fontSize: 18, color: C.muted }}>25 USDC → 0.30 SOL · Policy approved</div>
            </div>
          </div>
        </SlideIn>
      </div>
    </AbsoluteFill>
  );
}

// Scene 14: Telegram mockup (30-32s = 900-960)
function S14() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ ...center, padding: "40px 200px" }}>
        <SlideIn from="right" delay={3}>
          <MockupImg src="product-mockup-telegram.png" style={{ maxWidth: 400 }} />
        </SlideIn>
      </div>
    </AbsoluteFill>
  );
}

// Scene 15: Split screen (32-36s = 960-1080)
function S15() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ display: "flex", height: "100%", padding: "60px 80px", gap: 48, alignItems: "center" }}>
        <SlideIn from="left" delay={3} style={{ flex: 2 }}>
          <MockupImg src="product-mockup-dashboard.png" />
        </SlideIn>
        <SlideIn from="right" delay={10} style={{ flex: 1 }}>
          <MockupImg src="product-mockup-telegram.png" style={{ maxWidth: 350 }} />
        </SlideIn>
      </div>
    </AbsoluteFill>
  );
}

// Scene 16: Stats counter (36-40s = 1080-1200)
function S16() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ ...center, flexDirection: "row", gap: 120 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 72, fontWeight: 200, color: C.text }}>
            <CountUp target={10000} suffix="+" duration={25} />
          </div>
          <div style={{ fontSize: 18, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Agents Deployed</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <SnapText delay={10} style={{ fontSize: 72, fontWeight: 200, color: C.green }}>
            $2.4M
          </SnapText>
          <div style={{ fontSize: 18, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Traded</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// Scene 17: Feature rapid fire (40-45s = 1200-1350)
function S17() {
  const frame = useCurrentFrame();
  const features = [
    { text: "PERSISTENT MEMORY", Icon: Brain, color: C.violetLight },
    { text: "REAL CRYPTO WALLETS", Icon: Shield, color: C.amber },
    { text: "POLICY GUARDRAILS", Icon: Lock, color: C.emerald },
    { text: "TELEGRAM ALERTS", Icon: Bell, color: C.blue },
  ];
  const perFeature = 36; // 1.2s each
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        {features.map((f, i) => {
          const start = i * perFeature;
          const opacity = interpolate(frame, [start, start + 6, start + perFeature - 6, start + perFeature], [0, 1, 1, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const scale = interpolate(frame, [start, start + 6], [1.05, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={f.text} style={{
              position: "absolute", display: "flex", alignItems: "center", gap: 24,
              opacity, transform: `scale(${scale})`,
            }}>
              <f.Icon size={40} color={f.color} strokeWidth={1.5} />
              <span style={{ fontSize: 48, fontWeight: 200, color: C.text, letterSpacing: "-0.02em" }}>{f.text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// Scene 18: "NOT A CHATBOT" → "YOUR AI ARMY" (45-50s = 1350-1500)
function S18() {
  const frame = useCurrentFrame();
  const phase2Start = 60;
  const showPhase2 = frame >= phase2Start;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        {!showPhase2 ? (
          <SnapText style={{ fontSize: 64, fontWeight: 200, color: C.muted, letterSpacing: "-0.03em" }}>
            THIS IS NOT A CHATBOT
          </SnapText>
        ) : (
          <SnapText style={{
            fontSize: 80, fontWeight: 300, letterSpacing: "-0.03em",
            background: `linear-gradient(135deg, ${C.text}, ${C.violetLight})`,
            backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            textShadow: `0 0 60px ${C.violet}40`,
          }}>
            THIS IS YOUR AI ARMY
          </SnapText>
        )}
      </div>
    </AbsoluteFill>
  );
}

// Scene 19: CTA (50-55s = 1500-1650)
function S19() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        <SnapText style={{ fontSize: 48, fontWeight: 300, color: C.text, letterSpacing: "-0.02em", marginBottom: 24 }}>
          DEPLOY YOURS TODAY
        </SnapText>
        <SnapText delay={15} style={{ fontSize: 22, fontFamily: "monospace", color: C.dim, marginBottom: 32 }}>
          forge-of-agents.vercel.app
        </SnapText>
        <SnapText delay={25} style={{
          fontSize: 36, fontWeight: 200,
          background: `linear-gradient(135deg, ${C.text}, ${C.violetLight})`,
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Agent Forge
        </SnapText>
      </div>
    </AbsoluteFill>
  );
}

// ─── Main Composition ───
export const AgentForgeDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <Audio src={staticFile("voiceover-adam.mp3")} />

      <Sequence from={0} durationInFrames={90}><S01 /></Sequence>
      <Sequence from={90} durationInFrames={60}><S02 /></Sequence>
      <Sequence from={150} durationInFrames={60}><S03 /></Sequence>
      <Sequence from={210} durationInFrames={60}><S04 /></Sequence>
      <Sequence from={270} durationInFrames={90}><S05 /></Sequence>
      <Sequence from={360} durationInFrames={60}><S06 /></Sequence>
      <Sequence from={420} durationInFrames={60}>
        <SCharacterVerb verb="RESEARCH" src="characters/char-analyst.png" glow={C.emerald} />
      </Sequence>
      <Sequence from={480} durationInFrames={60}>
        <SCharacterVerb verb="TRADE" src="characters/char-trader.png" glow={C.green} />
      </Sequence>
      <Sequence from={540} durationInFrames={60}>
        <SCharacterVerb verb="ANALYZE" src="characters/char-quant.png" glow={C.blue} />
      </Sequence>
      <Sequence from={600} durationInFrames={60}><S10 /></Sequence>
      <Sequence from={660} durationInFrames={120}><S11 /></Sequence>
      <Sequence from={780} durationInFrames={60}><S12 /></Sequence>
      <Sequence from={840} durationInFrames={60}><S13 /></Sequence>
      <Sequence from={900} durationInFrames={60}><S14 /></Sequence>
      <Sequence from={960} durationInFrames={120}><S15 /></Sequence>
      <Sequence from={1080} durationInFrames={120}><S16 /></Sequence>
      <Sequence from={1200} durationInFrames={150}><S17 /></Sequence>
      <Sequence from={1350} durationInFrames={150}><S18 /></Sequence>
      <Sequence from={1500} durationInFrames={150}><S19 /></Sequence>
    </AbsoluteFill>
  );
};
