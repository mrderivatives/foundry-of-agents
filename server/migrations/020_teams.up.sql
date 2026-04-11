CREATE TABLE team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL,
    name TEXT NOT NULL,
    lead_agent_id UUID REFERENCES agent(id),
    accent_color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_workspace ON team(workspace_id);

CREATE TABLE team_member (
    team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agent(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    specialist_role TEXT,
    position INT NOT NULL DEFAULT 0,
    PRIMARY KEY (team_id, agent_id)
);

CREATE INDEX idx_team_member_team ON team_member(team_id);
