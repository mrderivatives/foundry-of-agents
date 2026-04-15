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
    id: "crypto",
    name: "Crypto",
    emoji: "₿",
    accentColor: "#f59e0b",
    vibe: "AI-powered crypto research, analysis & trading.",
    description:
      "Your complete crypto intelligence unit — research, on-chain analysis, and trade execution.",
    lead: {
      role: "Director",
      name: "Director",
      characterId: "director",
      tagline: "The market never closes. Neither do we.",
    },
    specialists: [
      {
        id: "crypto-analyst",
        role: "Crypto Analyst",
        name: "Atlas",
        characterId: "analyst",
        tagline: "I find what others miss.",
        description:
          "Crypto analyst — project research, news, fundamentals, sentiment",
        teamId: "crypto",
      },
      {
        id: "crypto-quant",
        role: "On-Chain Quant",
        name: "Sigma",
        characterId: "quant",
        tagline: "The chain tells the truth.",
        description:
          "On-chain quant — technical analysis, price patterns, DeFi metrics",
        teamId: "crypto",
      },
      {
        id: "crypto-trader",
        role: "Crypto Trader",
        name: "Flash",
        characterId: "trader",
        tagline: "Execute with precision.",
        description:
          "Crypto trader — trade execution, risk management, DCA strategies",
        teamId: "crypto",
      },
    ],
  },
  {
    id: "markets-finance",
    name: "Markets & Finance",
    emoji: "📈",
    accentColor: "#10b981",
    vibe: "Institutional-grade market intelligence & portfolio management.",
    description:
      "Stocks, macro, crypto, commodities — your personal trading floor.",
    lead: {
      role: "Managing Director",
      name: "Director",
      characterId: "director",
      tagline: "The market doesn't sleep. Neither do we.",
    },
    specialists: [
      {
        id: "analyst",
        role: "Analyst",
        name: "Atlas",
        characterId: "analyst",
        tagline: "I find what others miss.",
        description:
          "Analyst — deep fundamental research, news analysis, macro data, market sentiment",
        teamId: "markets-finance",
      },
      {
        id: "quant",
        role: "Quant",
        name: "Sigma",
        characterId: "quant",
        tagline: "The numbers don't lie.",
        description:
          "Quant — technical analysis, price patterns, statistical signals, data science",
        teamId: "markets-finance",
      },
      {
        id: "trader",
        role: "Trader",
        name: "Flash",
        characterId: "trader",
        tagline: "Execution is everything.",
        description:
          "Trader — entry/exit points, position sizing, risk/reward, execution strategy",
        teamId: "markets-finance",
      },
    ],
  },
  {
    id: "predictions-sports",
    name: "Predictions & Sports",
    emoji: "🏆",
    accentColor: "#f59e0b",
    vibe: "Sports analytics, fantasy management & prediction markets.",
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
        characterId: "oracle",
        tagline: "Your league isn't ready for what I found.",
        description:
          "Fantasy Manager — player stats, matchups, injury reports, roster optimization",
        teamId: "predictions-sports",
      },
      {
        id: "gambling-guru",
        role: "Gambling Guru",
        name: "Ace",
        characterId: "gambling-guru",
        tagline: "The line just moved. We're in.",
        description:
          "Gambling Guru — odds analysis, value betting, line movements, bankroll management",
        teamId: "predictions-sports",
      },
      {
        id: "sports-journalist",
        role: "Sports Journalist",
        name: "Scoop",
        characterId: "journalist",
        tagline: "I know before ESPN does.",
        description:
          "Sports Journalist — breaking news, analysis pieces, developing stories",
        teamId: "predictions-sports",
      },
    ],
  },
  {
    id: "career-pro",
    name: "Career Pro",
    emoji: "💼",
    accentColor: "#3b82f6",
    vibe: "Get promoted. Get organized. Get ahead.",
    description:
      "Your career advancement team — planning, analysis, and strategic networking.",
    lead: {
      role: "Chief of Staff",
      name: "Chief of Staff",
      characterId: "chief",
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
          "Planner — scheduling, goals, time management, productivity systems",
        teamId: "career-pro",
      },
      {
        id: "career-analyst",
        role: "Analyst",
        name: "Sharp",
        characterId: "analyst",
        tagline: "The data tells the story.",
        description:
          "Analyst — market research, salary data, skill assessment, career mapping",
        teamId: "career-pro",
      },
      {
        id: "networking",
        role: "Networking & Growth",
        name: "Link",
        characterId: "networker",
        tagline: "Your network is your net worth.",
        description:
          "Networker — outreach strategy, LinkedIn optimization, relationship building",
        teamId: "career-pro",
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
      role: "COO",
      name: "COO",
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
