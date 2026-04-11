import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export interface CharacterProps {
  size?: number;
}

const characters: Record<string, ComponentType<CharacterProps>> = {
  coach: dynamic(() => import("./Coach")),
  "fantasy-manager": dynamic(() => import("./FantasyManager")),
  "gambling-guru": dynamic(() => import("./GamblingGuru")),
  "sports-journalist": dynamic(() => import("./SportsJournalist")),
  "managing-director": dynamic(() => import("./ManagingDirector")),
  analyst: dynamic(() => import("./Analyst")),
  quant: dynamic(() => import("./Quant")),
  trader: dynamic(() => import("./Trader")),
  "chief-of-staff": dynamic(() => import("./ChiefOfStaff")),
  planner: dynamic(() => import("./Planner")),
  "career-analyst": dynamic(() => import("./CareerAnalyst")),
  "networking-growth": dynamic(() => import("./NetworkingGrowth")),
  "product-chief": dynamic(() => import("./ProductChief")),
  cto: dynamic(() => import("./CTO")),
  "growth-hacker": dynamic(() => import("./GrowthHacker")),
  cfo: dynamic(() => import("./CFO")),
  "default-lead": dynamic(() => import("./DefaultLead")),
};

export function getCharacter(id: string): ComponentType<CharacterProps> | null {
  return characters[id] ?? null;
}

export { default as Coach } from "./Coach";
export { default as FantasyManager } from "./FantasyManager";
export { default as GamblingGuru } from "./GamblingGuru";
export { default as SportsJournalist } from "./SportsJournalist";
export { default as ManagingDirector } from "./ManagingDirector";
export { default as Analyst } from "./Analyst";
export { default as Quant } from "./Quant";
export { default as Trader } from "./Trader";
export { default as ChiefOfStaff } from "./ChiefOfStaff";
export { default as Planner } from "./Planner";
export { default as CareerAnalyst } from "./CareerAnalyst";
export { default as NetworkingGrowth } from "./NetworkingGrowth";
export { default as ProductChief } from "./ProductChief";
export { default as CTO } from "./CTO";
export { default as GrowthHacker } from "./GrowthHacker";
export { default as CFO } from "./CFO";
export { default as DefaultLead } from "./DefaultLead";

export { characters };
