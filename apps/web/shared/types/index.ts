export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  timezone: string;
  onboarding_state: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings: Record<string, unknown>;
  tier: "free" | "pro" | "enterprise";
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  workspace_id: string;
  runtime_id?: string;
  name: string;
  description?: string;
  instructions?: string;
  avatar_url?: string;
  model?: string;
  fallback_models?: string[];
  max_concurrent_tasks: number;
  status: "idle" | "working" | "blocked" | "error" | "offline";
  visibility: "workspace" | "private";
  owner_id: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  agent_id?: string;
  runtime_id?: string;
  source_type: string;
  prompt?: string;
  context?: Record<string, unknown>;
  session_id?: string;
  status: "queued" | "dispatched" | "working" | "completed" | "failed" | "cancelled";
  priority: number;
  attempts: number;
  max_attempts: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  workspace_id: string;
  agent_id: string;
  creator_id: string;
  title?: string;
  session_id?: string;
  channel?: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_session_id: string;
  workspace_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  task_id?: string;
  tool_calls?: Record<string, unknown>;
  input_tokens?: number;
  output_tokens?: number;
  model?: string;
  cost_usd?: string;
  created_at: string;
}

export interface MemoryEntry {
  id: string;
  agent_id: string;
  workspace_id: string;
  content: string;
  memory_type: "episodic" | "semantic" | "entity" | "identity" | "user_context";
  entity_name?: string;
  entity_type?: string;
  importance_score: number;
  tags?: string[];
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  workspace_id: string;
  chain: string;
  action: string;
  status: string;
  input_token?: string;
  input_amount?: string;
  input_value_usd?: string;
  output_token?: string;
  output_amount?: string;
  output_value_usd?: string;
  created_at: string;
}
