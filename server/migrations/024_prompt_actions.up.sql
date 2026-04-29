-- Prompt action definitions
CREATE TABLE IF NOT EXISTS prompt_action (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT NOT NULL DEFAULT 'quick',
    team_templates TEXT[] NOT NULL DEFAULT '{}',
    prompt_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    expected_output TEXT DEFAULT 'inline',
    estimated_seconds INT DEFAULT 60,
    system_prompt_override TEXT,
    dispatch_plan JSONB,
    sort_order INT DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with the 14 actions from Phase 1
INSERT INTO prompt_action (slug, name, description, icon, category, team_templates, prompt_template, variables, expected_output, estimated_seconds, sort_order) VALUES
('crypto-deep-dive', 'Deep Dive Report', 'Comprehensive token research & analysis', '📊', 'trending', '{crypto,markets-finance}', 'Create a comprehensive research report on {token}. Include: price action, market cap, volume, key metrics, recent news, sentiment analysis, competitive landscape, and risk assessment.', '[{"name":"token","type":"select+freetext","label":"Token","suggestions":["SOL","ETH","BTC","BONK","WIF","JUP","RENDER","ONDO"],"placeholder":"Enter token symbol..."}]', 'inline', 180, 1),
('crypto-daily-briefing', 'Daily Briefing', 'Morning market summary', '📈', 'trending', '{crypto,markets-finance}', 'Give me a daily briefing on {token}. Summarize: price change, volume, major news, whale movements, and social sentiment.', '[{"name":"token","type":"select+freetext","label":"Token","suggestions":["SOL","ETH","BTC","Market Overview"],"placeholder":"Enter token or topic..."}]', 'inline', 120, 2),
('crypto-compare', 'Token Comparison', 'Side-by-side token analysis', '🔍', 'trending', '{crypto,markets-finance}', 'Compare {tokenA} vs {tokenB}: market cap, volume, recent performance, use case, team, ecosystem, and which is the better hold right now.', '[{"name":"tokenA","type":"select+freetext","label":"Token A","suggestions":["SOL","ETH","BTC"],"placeholder":"First token..."},{"name":"tokenB","type":"select+freetext","label":"Token B","suggestions":["ETH","SOL","BTC"],"placeholder":"Second token..."}]', 'inline', 180, 3),
('crypto-swap', 'Swap Tokens', 'Execute a token swap', '💰', 'quick', '{crypto}', 'Swap {amount} {inputToken} to {outputToken}', '[{"name":"amount","type":"freetext","label":"Amount","placeholder":"1.0"},{"name":"inputToken","type":"select+freetext","label":"From","suggestions":["SOL","USDC","USDT"],"placeholder":"Token to sell..."},{"name":"outputToken","type":"select+freetext","label":"To","suggestions":["USDC","SOL","USDT"],"placeholder":"Token to buy..."}]', 'inline', 30, 4),
('crypto-portfolio', 'Portfolio Check', 'Check your wallet balance', '💼', 'quick', '{crypto,markets-finance}', 'What''s my portfolio worth? Show me all balances, current prices, 24h change, and total value in USD.', '[]', 'inline', 10, 5),
('crypto-market-pulse', 'Market Pulse', 'Today''s crypto headlines', '🌍', 'quick', '{crypto,markets-finance}', 'What happened in crypto today? Top movers, major news, market sentiment, and any notable events.', '[]', 'inline', 120, 6),
('crypto-price-alert', 'Price Alert', 'Set a price notification', '🔔', 'quick', '{crypto}', 'Set up a price alert: notify me on Telegram when {token} hits ${price}.', '[{"name":"token","type":"select+freetext","label":"Token","suggestions":["SOL","ETH","BTC"],"placeholder":"Token..."},{"name":"price","type":"freetext","label":"Target Price ($)","placeholder":"200"}]', 'cron_job', 10, 7),
('research-company', 'Company Brief', 'Full company research & analysis', '🏢', 'trending', '{markets-finance,product-business,career-pro}', 'Research {company} and give me a full briefing: what they do, leadership, funding, traction, recent news, and competitive position.', '[{"name":"company","type":"freetext","label":"Company","placeholder":"e.g. OpenAI, Stripe, Coinbase..."}]', 'inline', 180, 8),
('research-person', 'Person Brief', 'Background research on anyone', '👤', 'trending', '{markets-finance,product-business,career-pro}', 'Who is {person}? Full background: career history, key achievements, controversies, current role, and why they matter.', '[{"name":"person","type":"freetext","label":"Person","placeholder":"e.g. Sam Altman, Jensen Huang..."}]', 'inline', 180, 9),
('research-competitive', 'Competitive Analysis', 'Compare against top competitors', '⚔️', 'trending', '{markets-finance,product-business}', 'Analyze {company} against their top 3-5 competitors: product comparison, pricing, traction, team strength, and market position.', '[{"name":"company","type":"freetext","label":"Company","placeholder":"e.g. Figma, Notion..."}]', 'inline', 180, 10),
('research-news', 'News Digest', 'This week''s key developments', '📰', 'quick', '{markets-finance,product-business,career-pro,predictions-sports}', 'What happened with {topic} this week? Key developments, product launches, funding rounds, and what to watch next.', '[{"name":"topic","type":"freetext","label":"Topic","placeholder":"e.g. AI, crypto, fintech..."}]', 'inline', 120, 11),
('sports-picks', 'Today''s Picks', 'Best bets and predictions', '🎯', 'trending', '{predictions-sports}', 'What are today''s best sports picks? Analyze the matchups, odds, and give me your top 3 predictions with confidence levels.', '[]', 'inline', 120, 12),
('sports-fantasy', 'Fantasy Advice', 'Waiver wire & lineup help', '🏆', 'trending', '{predictions-sports}', 'Who should I pick up off waivers this week? Analyze trending players, matchups, and give me your top 5 pickups with reasoning.', '[]', 'inline', 120, 13),
('custom-ask-team', 'Ask the Team', 'Get multi-perspective analysis', '🧠', 'trending', '{custom}', 'I need your team to research and analyze: {question}. Have each specialist contribute their perspective, then synthesize.', '[{"name":"question","type":"freetext","label":"Question","placeholder":"What should the team research?"}]', 'inline', 180, 14);

-- System prompt overrides for key actions (Phase 4)
UPDATE prompt_action SET system_prompt_override = 'You are a senior crypto analyst preparing a formal research report. Structure your response with clear sections: Executive Summary, Price Action & Technicals, Fundamentals, Market Sentiment, Competitive Landscape, Risk Assessment, and Verdict. Use data and cite sources. Be thorough but concise.' WHERE slug = 'crypto-deep-dive';

UPDATE prompt_action SET system_prompt_override = 'You are a market intelligence analyst delivering a morning briefing. Be concise, data-driven, and actionable. Start with the most important development, then cover price action, volume, news, and outlook. End with "Watch for:" items.' WHERE slug = 'crypto-daily-briefing';

UPDATE prompt_action SET system_prompt_override = 'You are a comparative analyst. Structure your response as a clear side-by-side comparison with categories. Use a verdict at the end with a clear recommendation. Include data where possible.' WHERE slug = 'crypto-compare';

UPDATE prompt_action SET system_prompt_override = 'You are a business intelligence analyst preparing an executive briefing. Structure: Company Overview, Leadership, Funding & Financials, Product & Traction, Competitive Position, Recent Developments, Assessment. Be factual and thorough.' WHERE slug = 'research-company';

UPDATE prompt_action SET system_prompt_override = 'You are a research analyst preparing a person profile. Structure: Background, Career Timeline, Key Achievements, Current Role & Influence, Controversies/Criticism, Why They Matter. Be factual and well-sourced.' WHERE slug = 'research-person';

-- Prompt action execution tracking
CREATE TABLE IF NOT EXISTS prompt_action_execution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID REFERENCES prompt_action(id),
    workspace_id UUID NOT NULL,
    agent_id UUID NOT NULL,
    variables JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INT,
    output_type TEXT,
    success BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pae_action ON prompt_action_execution(action_id);
CREATE INDEX idx_pae_workspace ON prompt_action_execution(workspace_id);
CREATE INDEX idx_pa_team_templates ON prompt_action USING GIN(team_templates);
