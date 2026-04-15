CREATE TABLE IF NOT EXISTS dataroom_visitor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    first_visit TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_visit TIMESTAMPTZ NOT NULL DEFAULT now(),
    visit_count INT DEFAULT 1,
    total_time_seconds INT DEFAULT 0,
    sections_viewed TEXT[] DEFAULT '{}',
    deepest_section TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataroom_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID REFERENCES dataroom_visitor(id),
    event_type TEXT NOT NULL,
    section TEXT,
    duration_seconds INT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dr_visitor_email ON dataroom_visitor(email);
CREATE INDEX IF NOT EXISTS idx_dr_event_visitor ON dataroom_event(visitor_id);
