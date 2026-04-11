export interface Specialist {
  id: string;
  role: string;
  name: string;
  characterId: string;
  tagline: string;
  description: string;
  teamId: string;
}

export interface TeamTemplate {
  id: string;
  name: string;
  emoji: string;
  accentColor: string;
  vibe: string;
  description: string;
  lead: {
    role: string;
    name: string;
    characterId: string;
    tagline: string;
  };
  specialists: Specialist[];
}

export const TEAMS: TeamTemplate[] = [
  {
    id: "sports",
    name: "Sports Team",
    emoji: "🏆",
    accentColor: "#f59e0b",
    vibe: "Win your league. Beat the bookie. Know every trade.",
    description:
      "Fantasy, betting, and breaking news — your complete sports intelligence unit.",
    lead: {
      role: "Coach",
      name: "Coach",
      characterId: "coach",
      tagline: "I call the plays. You make the picks.",
    },
    specialists: [
      {
        id: "fantasy-mgr",
        role: "Fantasy Manager",
        name: "Oracle",
        characterId: "fantasy-manager",
        tagline: "Your league isn't ready for what I found.",
        description:
          "Manages fantasy leagues, waiver wire, trade analysis",
        teamId: "sports",
      },
      {
        id: "gambling-guru",
        role: "Gambling Guru",
        name: "Ace",
        characterId: "gambling-guru",
        tagline: "The line just moved. We're in.",
        description: "Odds analysis, line movements, value bets",
        teamId: "sports",
      },
      {
        id: "sports-journalist",
        role: "Sports Journalist",
        name: "Scoop",
        characterId: "sports-journalist",
        tagline: "I know before ESPN does.",
        description: "Breaking news, trade rumors, injury reports",
        teamId: "sports",
      },
    ],
  },
  {
    id: "market-research",
    name: "Market Research",
    emoji: "📈",
    accentColor: "#10b981",
    vibe: "Goldman Sachs vibes. Your personal trading floor.",
    description:
      "Institutional-grade research, analysis, and execution for your portfolio.",
    lead: {
      role: "Managing Director",
      name: "Director",
      characterId: "managing-director",
      tagline: "The market doesn't sleep. Neither do we.",
    },
    specialists: [
      {
        id: "analyst",
        role: "Analyst",
        name: "Atlas",
        characterId: "analyst",
        tagline: "I find what others miss.",
        description: "Deep fundamental research, due diligence",
        teamId: "market-research",
      },
      {
        id: "quant",
        role: "Quant",
        name: "Sigma",
        characterId: "quant",
        tagline: "The numbers don't lie.",
        description:
          "Technical analysis, pattern recognition, data science",
        teamId: "market-research",
      },
      {
        id: "trader",
        role: "Trader",
        name: "Flash",
        characterId: "trader",
        tagline: "Execution is everything.",
        description: "Trade execution, order management, timing",
        teamId: "market-research",
      },
    ],
  },
  {
    id: "career-bro",
    name: "Career Bro",
    emoji: "💼",
    accentColor: "#3b82f6",
    vibe: "Get promoted. Get organized. Get ahead.",
    description:
      "Your career advancement team — planning, analysis, and strategic networking.",
    lead: {
      role: "Chief of Staff",
      name: "Chief",
      characterId: "chief-of-staff",
      tagline: "I coordinate. You decide.",
    },
    specialists: [
      {
        id: "planner",
        role: "Planner",
        name: "Tempo",
        characterId: "planner",
        tagline: "Everything on schedule.",
        description:
          "Calendar management, task planning, communications",
        teamId: "career-bro",
      },
      {
        id: "career-analyst",
        role: "Analyst",
        name: "Sharp",
        characterId: "career-analyst",
        tagline: "The data tells the story.",
        description: "Spreadsheets, presentations, analysis",
        teamId: "career-bro",
      },
      {
        id: "networking",
        role: "Networking & Growth",
        name: "Link",
        characterId: "networking-growth",
        tagline: "Your network is your net worth.",
        description:
          "Networking strategy, growth hacking, relationship management",
        teamId: "career-bro",
      },
    ],
  },
  {
    id: "product-business",
    name: "Product & Business",
    emoji: "🚀",
    accentColor: "#8b5cf6",
    vibe: "Build and scale your startup.",
    description:
      "From product vision to fundraising — your full executive team.",
    lead: {
      role: "Chief of Staff",
      name: "Nexus",
      characterId: "product-chief",
      tagline: "I keep the machine running.",
    },
    specialists: [
      {
        id: "cto",
        role: "CTO",
        name: "Forge",
        characterId: "cto",
        tagline: "Ship it. Ship it now.",
        description:
          "Technical leadership, architecture, product development",
        teamId: "product-business",
      },
      {
        id: "growth-hacker",
        role: "Growth Hacker",
        name: "Viral",
        characterId: "growth-hacker",
        tagline: "Let me make this blow up.",
        description:
          "Marketing, content, virality, user acquisition",
        teamId: "product-business",
      },
      {
        id: "cfo",
        role: "CFO",
        name: "Ledger",
        characterId: "cfo",
        tagline: "Every dollar accounted for.",
        description: "Financial planning, fundraising, budgets",
        teamId: "product-business",
      },
    ],
  },
  {
    id: "custom",
    name: "Choose Your Own",
    emoji: "⚡",
    accentColor: "#ec4899",
    vibe: "Mix and match. Build the perfect team.",
    description:
      "Pick your Lead, then choose ANY 3 specialists from across all teams.",
    lead: {
      role: "Chief of Staff",
      name: "Commander",
      characterId: "default-lead",
      tagline: "Your mission, my team.",
    },
    specialists: [],
  },
];

export const ALL_SPECIALISTS: Specialist[] = TEAMS.flatMap(
  (t) => t.specialists
);
