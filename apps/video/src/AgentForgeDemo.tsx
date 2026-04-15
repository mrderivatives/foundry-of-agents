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

// ─── Ken Burns Scene ───
function KenBurns({
  src,
  zoom,
  pan,
}: {
  src: string;
  zoom?: "in" | "out";
  pan?: "left" | "right";
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;

  const scale =
    zoom === "in"
      ? interpolate(p, [0, 1], [1, 1.08])
      : zoom === "out"
        ? interpolate(p, [0, 1], [1.08, 1])
        : 1.02;

  const tx =
    pan === "right"
      ? interpolate(p, [0, 1], [0, -30])
      : pan === "left"
        ? interpolate(p, [0, 1], [-30, 0])
        : 0;

  // Fade in/out
  const opacity = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${tx}px)`,
        }}
      />
    </AbsoluteFill>
  );
}

// ─── Reveal Scene (dramatic) ───
function RevealScene({ src }: { src: string }) {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 8, 20], [1.1, 1.02, 1], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
}

// ─── Product Recording (Tella) ───
function TellaRecording({
  startSec,
  endSec,
}: {
  startSec: number;
  endSec: number;
}) {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <OffthreadVideo
        src={staticFile("tella-recording.mp4")}
        startFrom={Math.round(startSec * 30)}
        endAt={Math.round(endSec * 30)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </AbsoluteFill>
  );
}

// ─── CTA Scene ───
function CTAScene() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 80,
          height: 80,
          marginBottom: 24,
          transform: `scale(${logoScale})`,
        }}
      />
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#fafafa",
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        AGENT FORGE
      </div>
      <div
        style={{
          fontSize: 22,
          color: "#a1a1aa",
          fontFamily: "Inter, system-ui, sans-serif",
          marginTop: 12,
          fontWeight: 300,
        }}
      >
        Deploy Your Army
      </div>
      <div
        style={{
          fontSize: 16,
          color: "#7c3aed",
          fontFamily: "monospace",
          marginTop: 28,
        }}
      >
        forge-of-agents.vercel.app
      </div>
    </AbsoluteFill>
  );
}

// ─── Main Composition: 97 seconds ───
export const AgentForgeDemo: React.FC = () => {
  const fps = 30;

  // Scene timings (in seconds → frames)
  // ACT 1: Concept scenes synced to voiceover (0-43s)
  const scenes = [
    { src: "scenes/scene1-chatbot.png", start: 0, dur: 5, zoom: "in" as const, pan: undefined },
    { src: "scenes/scene2-shatter.png", start: 4.5, dur: 5, zoom: undefined, pan: "right" as const },
    { src: "scenes/scene3-agents.png", start: 9, dur: 6, zoom: "out" as const, pan: undefined },
    { src: "scenes/scene4-opensource.png", start: 14.5, dur: 5, zoom: "in" as const, pan: undefined },
    { src: "scenes/scene5-early.png", start: 19, dur: 4, zoom: "in" as const, pan: undefined },
    { src: "scenes/scene6-lockedin.png", start: 22.5, dur: 10, zoom: undefined, pan: "right" as const },
    { src: "scenes/scene7-vision.png", start: 32, dur: 8, zoom: "out" as const, pan: undefined },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Voiceover — full track */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* ACT 1: Concept scenes with Ken Burns */}
      {scenes.map((s, i) => (
        <Sequence
          key={i}
          from={Math.round(s.start * fps)}
          durationInFrames={Math.round(s.dur * fps)}
        >
          <KenBurns src={s.src} zoom={s.zoom} pan={s.pan} />
        </Sequence>
      ))}

      {/* THE REVEAL — 0.5s black then scene8 */}
      <Sequence from={40 * fps} durationInFrames={15}>
        <AbsoluteFill style={{ backgroundColor: BG }} />
      </Sequence>
      <Sequence from={Math.round(40.5 * fps)} durationInFrames={Math.round(3 * fps)}>
        <RevealScene src="scenes/scene8-reveal.png" />
      </Sequence>

      {/* ACT 2: Tella screen recording (43-87s) */}
      <Sequence from={43 * fps} durationInFrames={44 * fps}>
        <TellaRecording startSec={0} endSec={87} />
      </Sequence>

      {/* CTA (87-97s) */}
      <Sequence from={87 * fps} durationInFrames={10 * fps}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
