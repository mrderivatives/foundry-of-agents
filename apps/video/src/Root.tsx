import React from "react";
import { Composition } from "remotion";
import { AgentForgeDemo } from "./AgentForgeDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AgentForgeDemo"
      component={AgentForgeDemo}
      durationInFrames={2460}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
