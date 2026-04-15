import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BG = "#09090b";
const FPS = 30;

// ─── Ken Burns Scene ───
function KenBurns({ src, zoom, pan }: { src: string; zoom?: "in" | "out"; pan?: "left" | "right" }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;

  const scale = zoom === "in" ? interpolate(p, [0, 1], [1, 1.08])
    : zoom === "out" ? interpolate(p, [0, 1], [1.08, 1]) : 1.02;
  const tx = pan === "right" ? interpolate(p, [0, 1], [0, -30])
    : pan === "left" ? interpolate(p, [0, 1], [-30, 0]) : 0;
  const opacity = interpolate(frame, [0, 10, durationInFrames - 10, durationInFrames], [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Img src={staticFile(src)} style={{
        width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${scale}) translateX(${tx}px)`,
      }} />
    </AbsoluteFill>
  );
}

// ─── Reveal Scene ───
function RevealScene({ src }: { src: string }) {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 8, 20], [1.1, 1.02, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Img src={staticFile(src)} style={{
        width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${scale})`, opacity,
      }} />
    </AbsoluteFill>
  );
}

// ─── CTA Scene ───
function CTAScene() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: BG, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", opacity,
    }}>
      <Img src={staticFile("logo.png")} style={{ width: 80, height: 80, marginBottom: 24, transform: `scale(${logoScale})` }} />
      <div style={{ fontSize: 56, fontWeight: 700, color: "#fafafa", fontFamily: "Inter, system-ui", letterSpacing: "-0.02em" }}>
        AGENT FORGE
      </div>
      <div style={{ fontSize: 22, color: "#a1a1aa", fontFamily: "Inter, system-ui", marginTop: 12, fontWeight: 300 }}>
        Deploy Your Army
      </div>
      <div style={{ fontSize: 16, color: "#7c3aed", fontFamily: "monospace", marginTop: 28 }}>
        forge-of-agents.vercel.app
      </div>
    </AbsoluteFill>
  );
}

// ─── Main Composition: ~82 seconds = 2460 frames ───
export const AgentForgeDemo: React.FC = () => {
  // ACT 1: Concept scenes (0-35s) — FASTER pacing
  const act1 = [
    { src: "scenes/scene1-chatbot.png", start: 0, dur: 3, zoom: "in" as const },
    { src: "scenes/scene2-shatter.png", start: 2.8, dur: 3.5, pan: "right" as const },
    { src: "scenes/scene3-agents.png", start: 6, dur: 4, zoom: "out" as const },
    { src: "scenes/scene4-opensource.png", start: 9.5, dur: 3.5, zoom: "in" as const },
    { src: "scenes/scene5-early.png", start: 12.5, dur: 3, zoom: "in" as const },
    { src: "scenes/scene6-lockedin.png", start: 15, dur: 8, pan: "right" as const },
    { src: "scenes/scene7-vision.png", start: 22.5, dur: 7.5, zoom: "out" as const },
  ];

  // ACT 2: Tella recording cuts (35-75s)
  // Each segment: { videoStart (seconds into tella), displayDur (seconds on screen), playbackRate }
  const tellaSegments = [
    { from: 35, dur: 7, videoStart: 0, rate: 1.3 },      // Landing hero
    { from: 42, dur: 6, videoStart: 15, rate: 1.5 },      // Squad selection
    { from: 48, dur: 4, videoStart: 35, rate: 1.5 },      // Dashboard loading
    { from: 52, dur: 13, videoStart: 50, rate: 1.0 },     // CANVAS — full speed, money shot
    { from: 65, dur: 7, videoStart: 65, rate: 1.3 },      // Agent detail + team
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Trimmed voiceover — 75s */}
      <Audio src={staticFile("voiceover-trimmed.mp3")} />

      {/* ACT 1: Concept scenes with Ken Burns (0-35s) */}
      {act1.map((s, i) => (
        <Sequence key={i} from={Math.round(s.start * FPS)} durationInFrames={Math.round(s.dur * FPS)}>
          <KenBurns src={s.src} zoom={s.zoom} pan={s.pan} />
        </Sequence>
      ))}

      {/* THE REVEAL: 0.5s black → scene8 dramatic entrance */}
      <Sequence from={30 * FPS} durationInFrames={15}>
        <AbsoluteFill style={{ backgroundColor: BG }} />
      </Sequence>
      <Sequence from={Math.round(30.5 * FPS)} durationInFrames={Math.round(4.5 * FPS)}>
        <RevealScene src="scenes/scene8-reveal.png" />
      </Sequence>

      {/* ACT 2: Tella recording — smart cuts (35-72s) */}
      {tellaSegments.map((seg, i) => (
        <Sequence key={`tella-${i}`} from={seg.from * FPS} durationInFrames={seg.dur * FPS}>
          <AbsoluteFill style={{ backgroundColor: BG }}>
            <OffthreadVideo
              src={staticFile("tella-recording.mp4")}
              startFrom={Math.round(seg.videoStart * FPS)}
              playbackRate={seg.rate}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* CTA (75-82s) */}
      <Sequence from={75 * FPS} durationInFrames={7 * FPS}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
