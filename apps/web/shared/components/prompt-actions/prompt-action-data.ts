export interface PromptAction {
  id: string;
  name: string;
  icon: string; // emoji
  description: string;
  promptText: string;
  category: 'trending' | 'quick';
  teamIds: string[]; // which team templates this applies to
}

export const PROMPT_ACTIONS: PromptAction[] = [
  // Crypto team actions
  {
    id: 'crypto-deep-dive',
    name: 'Deep Dive Report',
    icon: '📊',
    description: 'Comprehensive token research & analysis',
    promptText: 'Create a comprehensive research report on SOL. Include: price action, market cap, volume, key metrics, recent news, sentiment analysis, competitive landscape, and risk assessment.',
    category: 'trending',
    teamIds: ['crypto', 'markets-finance'],
  },
  {
    id: 'crypto-daily-briefing',
    name: 'Daily Briefing',
    icon: '📈',
    description: 'Morning market summary',
    promptText: 'Give me a daily briefing on the crypto market. Summarize: top movers, major news, market sentiment, and what I should watch today.',
    category: 'trending',
    teamIds: ['crypto', 'markets-finance'],
  },
  {
    id: 'crypto-compare',
    name: 'Token Comparison',
    icon: '🔍',
    description: 'Side-by-side token analysis',
    promptText: 'Compare SOL vs ETH: market cap, volume, recent performance, use case, team, ecosystem, and which is the better hold right now.',
    category: 'trending',
    teamIds: ['crypto', 'markets-finance'],
  },
  {
    id: 'crypto-swap',
    name: 'Swap Tokens',
    icon: '💰',
    description: 'Execute a token swap',
    promptText: 'Swap 1 SOL to USDC',
    category: 'quick',
    teamIds: ['crypto'],
  },
  {
    id: 'crypto-portfolio',
    name: 'Portfolio Check',
    icon: '💼',
    description: "Check your wallet balance",
    promptText: "What's my portfolio worth? Show me all balances, current prices, 24h change, and total value in USD.",
    category: 'quick',
    teamIds: ['crypto', 'markets-finance'],
  },
  {
    id: 'crypto-market-pulse',
    name: 'Market Pulse',
    icon: '🌍',
    description: "Today's crypto headlines",
    promptText: 'What happened in crypto today? Top movers, major news, market sentiment, and any notable events.',
    category: 'quick',
    teamIds: ['crypto', 'markets-finance'],
  },
  {
    id: 'crypto-price-alert',
    name: 'Price Alert',
    icon: '🔔',
    description: 'Set a price notification',
    promptText: 'Set up a price alert: notify me on Telegram when SOL hits $200.',
    category: 'quick',
    teamIds: ['crypto'],
  },
  // Research/business team actions
  {
    id: 'research-company',
    name: 'Company Brief',
    icon: '🏢',
    description: 'Full company research & analysis',
    promptText: 'Research OpenAI and give me a full briefing: what they do, leadership, funding, traction, recent news, and competitive position.',
    category: 'trending',
    teamIds: ['markets-finance', 'product-business', 'career-pro'],
  },
  {
    id: 'research-person',
    name: 'Person Brief',
    icon: '👤',
    description: 'Background research on anyone',
    promptText: 'Who is Sam Altman? Full background: career history, key achievements, controversies, current role, and why they matter.',
    category: 'trending',
    teamIds: ['markets-finance', 'product-business', 'career-pro'],
  },
  {
    id: 'research-competitive',
    name: 'Competitive Analysis',
    icon: '⚔️',
    description: 'Compare against top competitors',
    promptText: 'Analyze OpenAI against their top 3-5 competitors: product comparison, pricing, traction, team strength, and market position.',
    category: 'trending',
    teamIds: ['markets-finance', 'product-business'],
  },
  {
    id: 'research-news',
    name: 'News Digest',
    icon: '📰',
    description: "This week's key developments",
    promptText: 'What happened with AI this week? Key developments, product launches, funding rounds, and what to watch next.',
    category: 'quick',
    teamIds: ['markets-finance', 'product-business', 'career-pro', 'predictions-sports'],
  },
  // Predictions/sports
  {
    id: 'sports-picks',
    name: "Today's Picks",
    icon: '🎯',
    description: 'Best bets and predictions',
    promptText: "What are today's best sports picks? Analyze the matchups, odds, and give me your top 3 predictions with confidence levels.",
    category: 'trending',
    teamIds: ['predictions-sports'],
  },
  {
    id: 'sports-fantasy',
    name: 'Fantasy Advice',
    icon: '🏆',
    description: 'Waiver wire & lineup help',
    promptText: 'Who should I pick up off waivers this week? Analyze trending players, matchups, and give me your top 5 pickups with reasoning.',
    category: 'trending',
    teamIds: ['predictions-sports'],
  },
  // Custom team — generic
  {
    id: 'custom-ask-team',
    name: 'Ask the Team',
    icon: '🧠',
    description: 'Get multi-perspective analysis',
    promptText: 'I need your team to research and analyze: What are the biggest trends shaping the next 12 months in our space? Have each specialist contribute their perspective.',
    category: 'trending',
    teamIds: ['custom'],
  },
];

export function getActionsForTeam(teamId: string): PromptAction[] {
  return PROMPT_ACTIONS.filter(a => a.teamIds.includes(teamId));
}

// Fallback: if no team ID, try to infer from agent description
export function getActionsForDescription(description?: string): PromptAction[] {
  const desc = (description || '').toLowerCase();
  if (desc.includes('crypto') || desc.includes('trading') || desc.includes('defi'))
    return getActionsForTeam('crypto');
  if (desc.includes('market') || desc.includes('finance') || desc.includes('research'))
    return getActionsForTeam('markets-finance');
  if (desc.includes('sports') || desc.includes('fantasy') || desc.includes('prediction'))
    return getActionsForTeam('predictions-sports');
  if (desc.includes('career') || desc.includes('productivity'))
    return getActionsForTeam('career-pro');
  if (desc.includes('product') || desc.includes('business') || desc.includes('startup'))
    return getActionsForTeam('product-business');
  // Default: show crypto actions (most popular)
  return getActionsForTeam('crypto');
}
