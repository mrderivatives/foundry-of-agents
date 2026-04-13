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

const C = {
  bg: "#09090b",
  surface: "#18181b",
  text: "#fafafa",
  muted: "#a1a1aa",
  dim: "#71717a",
  violet: "#7c3aed",
  green: "#22c55e",
  amber: "#f59e0b",
  emerald: "#10b981",
  blue: "#3b82f6",
  border: "rgba(255,255,255,0.06)",
};

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
};

const center: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  width: "100%",
};

function FadeText({
  children,
  fadeIn,
  fadeOut,
  y = 16,
  style,
}: {
  children: React.ReactNode;
  fadeIn: [number, number];
  fadeOut: [number, number];
  y?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [fadeIn[0], fadeIn[1], fadeOut[0], fadeOut[1]],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const translateY = interpolate(frame, fadeIn, [y, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)`, ...style }}>
      {children}
    </div>
  );
}

function CharAvatar({
  src,
  size,
  glow,
  delay = 0,
}: {
  src: string;
  size: number;
  glow: string;
  delay?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 80 } });
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.1)",
        boxShadow: `0 0 ${size / 3}px ${glow}`,
        transform: `scale(${s}) translateY(${(1 - s) * 40}px)`,
        opacity: s,
      }}
    >
      <Img src={staticFile(src)} style={{ width: size, height: size, objectFit: "cover" }} />
    </div>
  );
}

// ─── Scene 1: The Hook ───
function SceneHook() {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Img
        src={staticFile("hero-bg-network-complex.png")}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.08 }}
      />
      <div style={center}>
        <FadeText fadeIn={[0, 30]} fadeOut={[140, 175]} style={{
          fontSize: 64, fontWeight: 200, color: C.text, letterSpacing: "-0.03em",
          textAlign: "center", maxWidth: 900, lineHeight: 1.2,
        }}>
          The way we work is about to change forever.
        </FadeText>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 2: The Problem ───
function SceneProblem() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Img src={staticFile("hero-bg-network-complex.png")}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.05 }} />
      <div style={{ ...center, flexDirection: "row", gap: 48, padding: "0 120px" }}>
        {/* Left card */}
        <FadeText fadeIn={[0, 30]} fadeOut={[180, 210]} style={{ flex: 1 }}>
          <div style={{ ...glass, padding: 48, borderLeft: `3px solid ${C.amber}40` }}>
            <div style={{ fontSize: 36, fontWeight: 200, color: C.text, marginBottom: 16 }}>
              💰 Make money while you sleep
            </div>
            <div style={{ fontSize: 18, color: C.muted, lineHeight: 1.6 }}>
              Your AI team monitors markets 24/7, executes trades at optimal moments,
              and catches opportunities you'd miss asleep.
            </div>
            <div style={{ fontSize: 14, color: C.dim, fontStyle: "italic", marginTop: 24 }}>
              "My DCA bot caught the March dip at $88 SOL. I was sleeping." — @early_user
            </div>
          </div>
        </FadeText>
        {/* Right card */}
        <FadeText fadeIn={[15, 45]} fadeOut={[180, 210]} style={{ flex: 1 }}>
          <div style={{ ...glass, padding: 48, borderLeft: `3px solid ${C.blue}40` }}>
            <div style={{ fontSize: 36, fontWeight: 200, color: C.text, marginBottom: 16 }}>
              🛡️ Don't get replaced — lead the AI
            </div>
            <div style={{ fontSize: 18, color: C.muted, lineHeight: 1.6 }}>
              Everyone's hiring AI. The question isn't whether AI replaces your job —
              it's whether you're leading the AI or being replaced by it.
            </div>
            <div style={{ fontSize: 14, color: C.dim, fontStyle: "italic", marginTop: 24 }}>
              "I run a 4-agent team that does the research of 3 analysts." — @anon_user
            </div>
          </div>
        </FadeText>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 3: The Solution ───
function SceneSolution() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
  const chars = ["characters/char-coach.png", "characters/char-commander.png", "characters/char-analyst.png", "characters/char-trader.png", "characters/char-cto.png"];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        <div style={{
          fontSize: 80, fontWeight: 200, color: C.text, letterSpacing: "-0.03em",
          transform: `scale(${titleScale})`, opacity: titleScale,
          background: "linear-gradient(135deg, #fff, #7c3aed, rgba(255,255,255,0.5))",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Agent Forge
        </div>
        <FadeText fadeIn={[20, 50]} fadeOut={[180, 210]} style={{
          fontSize: 24, color: C.muted, marginTop: 16, fontWeight: 300,
        }}>
          Your AI Army. Deployed in 3 Minutes.
        </FadeText>
        <div style={{ display: "flex", gap: 24, marginTop: 48 }}>
          {chars.map((c, i) => (
            <CharAvatar key={c} src={c} size={72} glow={`${C.violet}40`} delay={40 + i * 10} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 4: Team Assembly ───
function SceneAssembly() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const specs = [
    { src: "characters/char-analyst.png", name: "Atlas", role: "Analyst", color: C.emerald },
    { src: "characters/char-quant.png", name: "Sigma", role: "Quant", color: C.blue },
    { src: "characters/char-trader.png", name: "Flash", role: "Trader", color: C.green },
  ];

  const leadS = spring({ frame, fps, config: { damping: 15 } });
  const lineProgress = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ ...center, gap: 0 }}>
        {/* Title */}
        <FadeText fadeIn={[0, 20]} fadeOut={[290, 320]} style={{
          fontSize: 32, fontWeight: 200, color: C.muted, marginBottom: 48, letterSpacing: "-0.02em",
        }}>
          Your Team is Assembling...
        </FadeText>

        {/* Lead */}
        <div style={{ textAlign: "center", transform: `translateY(${(1 - leadS) * -60}px)`, opacity: leadS }}>
          <div style={{ ...glass, padding: 24, display: "inline-block" }}>
            <CharAvatar src="characters/char-commander.png" size={96} glow={`${C.violet}50`} />
            <div style={{ fontSize: 20, fontWeight: 400, color: C.text, marginTop: 12 }}>Director</div>
            <div style={{ fontSize: 14, color: C.dim }}>Managing Director</div>
          </div>
        </div>

        {/* Connection lines */}
        <svg width={600} height={60} style={{ margin: "8px 0" }}>
          {[-200, 0, 200].map((x, i) => (
            <line key={i} x1={300} y1={0} x2={300 + x} y2={60}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1}
              strokeDasharray={80}
              strokeDashoffset={80 * (1 - lineProgress)} />
          ))}
        </svg>

        {/* Specialists */}
        <div style={{ display: "flex", gap: 48 }}>
          {specs.map((spec, i) => {
            const s = spring({ frame: frame - 50 - i * 15, fps, config: { damping: 15 } });
            return (
              <div key={spec.name} style={{
                textAlign: "center",
                transform: `translateY(${(1 - s) * 50}px)`,
                opacity: s,
              }}>
                <div style={{ ...glass, padding: 20 }}>
                  <CharAvatar src={spec.src} size={80} glow={`${spec.color}40`} delay={0} />
                  <div style={{ fontSize: 18, fontWeight: 400, color: C.text, marginTop: 10 }}>{spec.name}</div>
                  <div style={{ fontSize: 13, color: C.dim }}>{spec.role}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 5: Command Center ───
function SceneCommandCenter() {
  const frame = useCurrentFrame();
  const events = [
    { icon: "📋", agent: "Director", text: "Dispatched task to Atlas", color: C.violet },
    { icon: "🔍", agent: "Atlas", text: "Scanning market conditions...", color: C.emerald },
    { icon: "📊", agent: "Sigma", text: "Running technical analysis on SOL...", color: C.blue },
    { icon: "⚡", agent: "Flash", text: "Monitoring order books...", color: C.green },
    { icon: "✅", agent: "Atlas", text: "Analysis complete — SOL bullish", color: C.emerald },
    { icon: "💰", agent: "Flash", text: "Executed: 50 USDC → 0.38 SOL", color: C.green },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ display: "flex", height: "100%", padding: "60px 80px" }}>
        {/* Sidebar */}
        <div style={{ width: 240, borderRight: "1px solid rgba(255,255,255,0.04)", paddingRight: 24, paddingTop: 24 }}>
          <div style={{ fontSize: 12, color: C.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>Team</div>
          {[
            { name: "Director", role: "Lead", src: "characters/char-commander.png" },
            { name: "Atlas", role: "Analyst", src: "characters/char-analyst.png" },
            { name: "Sigma", role: "Quant", src: "characters/char-quant.png" },
            { name: "Flash", role: "Trader", src: "characters/char-trader.png" },
          ].map((a, i) => {
            const active = frame > 30 + i * 30;
            return (
              <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Img src={staticFile(a.src)} style={{ width: 36, height: 36, objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, color: C.text }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: C.dim }}>{a.role}</div>
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", marginLeft: "auto",
                  backgroundColor: active ? C.green : "#333",
                  transition: "all 0.3s",
                }} />
              </div>
            );
          })}
        </div>

        {/* Activity Feed */}
        <div style={{ flex: 1, paddingLeft: 48, paddingTop: 24, overflow: "hidden" }}>
          <div style={{ fontSize: 14, color: C.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24 }}>
            Activity Feed
          </div>
          {events.map((evt, i) => {
            const appearFrame = 30 + i * 35;
            const opacity = interpolate(frame, [appearFrame, appearFrame + 15], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            const y = interpolate(frame, [appearFrame, appearFrame + 15], [12, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <div key={i} style={{
                ...glass, padding: "14px 18px", marginBottom: 10,
                borderLeft: `2px solid ${evt.color}40`,
                opacity, transform: `translateY(${y}px)`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{evt.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: evt.color }}>{evt.agent}</span>
                  <span style={{ fontSize: 14, color: C.muted }}>{evt.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 6: Features ───
function SceneFeatures() {
  const frame = useCurrentFrame();
  const features = [
    { title: "Memory", desc: "Your agents remember everything", icon: "🧠" },
    { title: "Web Search", desc: "Live market data via Perplexity", icon: "🔍" },
    { title: "Wallet", desc: "Policy-controlled crypto execution", icon: "🛡️" },
    { title: "Notifications", desc: "Telegram alerts, 24/7", icon: "🔔" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        {features.map((f, i) => {
          const start = i * 60;
          const opacity = interpolate(frame, [start, start + 20, start + 50, start + 70], [0, 1, 1, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const x = interpolate(frame, [start, start + 20], [60, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <div key={f.title} style={{
              ...glass, padding: "32px 48px", position: "absolute",
              display: "flex", alignItems: "center", gap: 24, minWidth: 500,
              opacity, transform: `translateX(${x}px)`,
            }}>
              <span style={{ fontSize: 40 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: 28, fontWeight: 300, color: C.text }}>{f.title}</div>
                <div style={{ fontSize: 16, color: C.muted }}>{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 7: CTA ───
function SceneCTA() {
  const frame = useCurrentFrame();
  const lines = [
    { text: "This is not a chatbot.", start: 0 },
    { text: "This is your AI army.", start: 30 },
    { text: "Deploy yours today.", start: 60 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={center}>
        {lines.map((l) => {
          const opacity = interpolate(frame, [l.start, l.start + 20], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const y = interpolate(frame, [l.start, l.start + 20], [16, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <div key={l.text} style={{
              fontSize: l.start === 60 ? 56 : 44,
              fontWeight: l.start === 60 ? 300 : 200,
              color: l.start === 60 ? C.text : C.muted,
              opacity, transform: `translateY(${y}px)`,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}>
              {l.text}
            </div>
          );
        })}
        <FadeText fadeIn={[90, 110]} fadeOut={[190, 210]} style={{
          fontSize: 20, color: C.dim, fontFamily: "monospace", marginTop: 32,
        }}>
          forge-of-agents.vercel.app
        </FadeText>
        <FadeText fadeIn={[110, 130]} fadeOut={[190, 210]} style={{
          fontSize: 32, fontWeight: 200, marginTop: 24,
          background: "linear-gradient(135deg, #fff, #7c3aed)",
          backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Agent Forge
        </FadeText>
      </div>
    </AbsoluteFill>
  );
}

// ─── Main Composition ───
export const AgentForgeDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      {/* Audio */}
      <Audio src={staticFile("voiceover-adam.mp3")} />

      {/* Scenes */}
      <Sequence from={0} durationInFrames={180}><SceneHook /></Sequence>
      <Sequence from={150} durationInFrames={210}><SceneProblem /></Sequence>
      <Sequence from={330} durationInFrames={210}><SceneSolution /></Sequence>
      <Sequence from={510} durationInFrames={330}><SceneAssembly /></Sequence>
      <Sequence from={810} durationInFrames={450}><SceneCommandCenter /></Sequence>
      <Sequence from={1200} durationInFrames={300}><SceneFeatures /></Sequence>
      <Sequence from={1440} durationInFrames={210}><SceneCTA /></Sequence>
    </AbsoluteFill>
  );
};
