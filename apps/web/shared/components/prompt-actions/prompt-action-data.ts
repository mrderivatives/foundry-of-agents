import {
  FileBarChart,
  BarChart3,
  ArrowLeftRight,
  Repeat2,
  PieChart,
  Globe,
  BellRing,
  Building2,
  UserSearch,
  Scale,
  Newspaper,
  Target,
  Trophy,
  Brain,
  type LucideIcon,
} from 'lucide-react';

export interface PromptActionVariable {
  name: string;
  type: string;
  label: string;
  suggestions?: string[];
  placeholder?: string;
}

export interface PromptAction {
  id: string;
  slug: string;
  name: string;
  icon: LucideIcon;
  description: string;
  promptTemplate: string;
  category: 'trending' | 'quick';
  teamIds: string[];
  variables: PromptActionVariable[];
  estimatedSeconds: number;
}

export function hasVariables(action: PromptAction): boolean {
  return action.variables.length > 0;
}

export function composePrompt(action: PromptAction, values: Record<string, string>): string {
  let prompt = action.promptTemplate;
  Object.entries(values).forEach(([key, val]) => {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
  });
  return prompt;
}

export const PROMPT_ACTIONS: PromptAction[] = [
  {
    id: 'crypto-deep-dive',
    slug: 'crypto-deep-dive',
    name: 'Deep Dive Report',
    icon: FileBarChart,
    description: 'Comprehensive token research & analysis',
    promptTemplate: 'Create a comprehensive research report on {token}. Include: price action, market cap, volume, key metrics, recent news, sentiment analysis, competitive landscape, and risk assessment.',
    category: 'trending',
    teamIds: ['crypto', 'markets-finance'],
    variables: [{ name: 'token', type: 'select+freetext', label: 'Token', suggestions: ['SOL', 'ETH', 'BTC', 'BONK', 'WIF', 'JUP', 'RENDER', 'ONDO'], placeholder: 'Enter token symbol...' }],
    estimatedSeconds: 180,
  },
  {
    id: 'crypto-daily-briefing',
    slug: 'crypto-daily-briefing',
    name: 'Daily Briefing',
    icon: BarChart3,
    description: 'Morning market summary',
    promptTemplate: 'Give me a daily briefing on {token}. Summarize: price change, volume, major news, whale movements, and social sentiment.',
    category: 'trending',
    teamIds: ['crypto', 'markets-finance'],
    variables: [{ name: 'token', type: 'select+freetext', label: 'Token', suggestions: ['SOL', 'ETH', 'BTC', 'Market Overview'], placeholder: 'Enter token or topic...' }],
    estimatedSeconds: 120,
  },
  {
    id: 'crypto-compare',
    slug: 'crypto-compare',
    name: 'Token Comparison',
    icon: ArrowLeftRight,
    description: 'Side-by-side token analysis',
    promptTemplate: 'Compare {tokenA} vs {tokenB}: market cap, volume, recent performance, use case, team, ecosystem, and which is the better hold right now.',
    category: 'trending',
    teamIds: ['crypto', 'markets-finance'],
    variables: [
      { name: 'tokenA', type: 'select+freetext', label: 'Token A', suggestions: ['SOL', 'ETH', 'BTC'], placeholder: 'First token...' },
      { name: 'tokenB', type: 'select+freetext', label: 'Token B', suggestions: ['ETH', 'SOL', 'BTC'], placeholder: 'Second token...' },
    ],
    estimatedSeconds: 180,
  },
  {
    id: 'crypto-swap',
    slug: 'crypto-swap',
    name: 'Swap Tokens',
    icon: Repeat2,
    description: 'Execute a token swap',
    promptTemplate: 'Swap {amount} {inputToken} to {outputToken}',
    category: 'quick',
    teamIds: ['crypto'],
    variables: [
      { name: 'amount', type: 'freetext', label: 'Amount', placeholder: '1.0' },
      { name: 'inputToken', type: 'select+freetext', label: 'From', suggestions: ['SOL', 'USDC', 'USDT'], placeholder: 'Token to sell...' },
      { name: 'outputToken', type: 'select+freetext', label: 'To', suggestions: ['USDC', 'SOL', 'USDT'], placeholder: 'Token to buy...' },
    ],
    estimatedSeconds: 30,
  },
  {
    id: 'crypto-portfolio',
    slug: 'crypto-portfolio',
    name: 'Portfolio Check',
    icon: PieChart,
    description: 'Check your wallet balance',
    promptTemplate: "What's my portfolio worth? Show me all balances, current prices, 24h change, and total value in USD.",
    category: 'quick',
    teamIds: ['crypto', 'markets-finance'],
    variables: [],
    estimatedSeconds: 10,
  },
  {
    id: 'crypto-market-pulse',
    slug: 'crypto-market-pulse',
    name: 'Market Pulse',
    icon: Globe,
    description: "Today's crypto headlines",
    promptTemplate: 'What happened in crypto today? Top movers, major news, market sentiment, and any notable events.',
    category: 'quick',
    teamIds: ['crypto', 'markets-finance'],
    variables: [],
    estimatedSeconds: 120,
  },
  {
    id: 'crypto-price-alert',
    slug: 'crypto-price-alert',
    name: 'Price Alert',
    icon: BellRing,
    description: 'Set a price notification',
    promptTemplate: 'Set up a price alert: notify me on Telegram when {token} hits ${price}.',
    category: 'quick',
    teamIds: ['crypto'],
    variables: [
      { name: 'token', type: 'select+freetext', label: 'Token', suggestions: ['SOL', 'ETH', 'BTC'], placeholder: 'Token...' },
      { name: 'price', type: 'freetext', label: 'Target Price ($)', placeholder: '200' },
    ],
    estimatedSeconds: 10,
  },
  {
    id: 'research-company',
    slug: 'research-company',
    name: 'Company Brief',
    icon: Building2,
    description: 'Full company research & analysis',
    promptTemplate: 'Research {company} and give me a full briefing: what they do, leadership, funding, traction, recent news, and competitive position.',
    category: 'trending',
    teamIds: ['markets-finance', 'product-business', 'career-pro'],
    variables: [{ name: 'company', type: 'freetext', label: 'Company', placeholder: 'e.g. OpenAI, Stripe, Coinbase...' }],
    estimatedSeconds: 180,
  },
  {
    id: 'research-person',
    slug: 'research-person',
    name: 'Person Brief',
    icon: UserSearch,
    description: 'Background research on anyone',
    promptTemplate: 'Who is {person}? Full background: career history, key achievements, controversies, current role, and why they matter.',
    category: 'trending',
    teamIds: ['markets-finance', 'product-business', 'career-pro'],
    variables: [{ name: 'person', type: 'freetext', label: 'Person', placeholder: 'e.g. Sam Altman, Jensen Huang...' }],
    estimatedSeconds: 180,
  },
  {
    id: 'research-competitive',
    slug: 'research-competitive',
    name: 'Competitive Analysis',
    icon: Scale,
    description: 'Compare against top competitors',
    promptTemplate: 'Analyze {company} against their top 3-5 competitors: product comparison, pricing, traction, team strength, and market position.',
    category: 'trending',
    teamIds: ['markets-finance', 'product-business'],
    variables: [{ name: 'company', type: 'freetext', label: 'Company', placeholder: 'e.g. Figma, Notion...' }],
    estimatedSeconds: 180,
  },
  {
    id: 'research-news',
    slug: 'research-news',
    name: 'News Digest',
    icon: Newspaper,
    description: "This week's key developments",
    promptTemplate: 'What happened with {topic} this week? Key developments, product launches, funding rounds, and what to watch next.',
    category: 'quick',
    teamIds: ['markets-finance', 'product-business', 'career-pro', 'predictions-sports'],
    variables: [{ name: 'topic', type: 'freetext', label: 'Topic', placeholder: 'e.g. AI, crypto, fintech...' }],
    estimatedSeconds: 120,
  },
  {
    id: 'sports-picks',
    slug: 'sports-picks',
    name: "Today's Picks",
    icon: Target,
    description: 'Best bets and predictions',
    promptTemplate: "What are today's best sports picks? Analyze the matchups, odds, and give me your top 3 predictions with confidence levels.",
    category: 'trending',
    teamIds: ['predictions-sports'],
    variables: [],
    estimatedSeconds: 120,
  },
  {
    id: 'sports-fantasy',
    slug: 'sports-fantasy',
    name: 'Fantasy Advice',
    icon: Trophy,
    description: 'Waiver wire & lineup help',
    promptTemplate: 'Who should I pick up off waivers this week? Analyze trending players, matchups, and give me your top 5 pickups with reasoning.',
    category: 'trending',
    teamIds: ['predictions-sports'],
    variables: [],
    estimatedSeconds: 120,
  },
  {
    id: 'custom-ask-team',
    slug: 'custom-ask-team',
    name: 'Ask the Team',
    icon: Brain,
    description: 'Get multi-perspective analysis',
    promptTemplate: 'I need your team to research and analyze: {question}. Have each specialist contribute their perspective, then synthesize.',
    category: 'trending',
    teamIds: ['custom'],
    variables: [{ name: 'question', type: 'freetext', label: 'Question', placeholder: 'What should the team research?' }],
    estimatedSeconds: 180,
  },
];

export function getActionsForTeam(teamId: string): PromptAction[] {
  return PROMPT_ACTIONS.filter(a => a.teamIds.includes(teamId));
}

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
  return getActionsForTeam('crypto');
}
