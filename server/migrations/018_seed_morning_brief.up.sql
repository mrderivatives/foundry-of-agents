-- Seed morning brief cron job for Mat's agent
-- Only inserts if the agent exists
INSERT INTO cron_job (workspace_id, agent_id, owner_id, name, description, cron_expression, timezone, prompt, output_channel, output_target, enabled)
SELECT a.workspace_id, a.id,
    (SELECT user_id FROM member WHERE workspace_id = a.workspace_id AND role = 'owner' LIMIT 1),
    'Morning Brief',
    'Daily crypto market briefing delivered to Telegram',
    '30 11 * * *',
    'UTC',
    'Generate a concise morning crypto market brief. Cover BTC, ETH, SOL prices and sentiment. Top 3 news headlines. Keep it to 5 bullet points. Be concise and actionable.',
    'telegram',
    '207851519',
    true
FROM agent a WHERE a.id = '17f3d186-3d15-44ca-b83d-8eaf81b54f9a'
ON CONFLICT DO NOTHING;
