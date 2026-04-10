"use client";

import { useState } from "react";
import { useAgentStore } from "@/features/agents/store";
import { AgentList } from "@/features/agents/components/agent-list";
import { CreateAgentDialog } from "@/features/agents/components/create-agent-dialog";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { agents } = useAgentStore();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Your Agents</h2>
          <p className="text-sm text-muted-foreground">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} deployed
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Agent
        </button>
      </div>
      <AgentList />
      {showCreate && (
        <CreateAgentDialog onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
