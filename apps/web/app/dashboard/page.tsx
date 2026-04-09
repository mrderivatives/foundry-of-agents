"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/shared/api/client";
import { useAgentStore } from "@/features/agents/store";
import { AgentList } from "@/features/agents/components/agent-list";
import { CreateAgentDialog } from "@/features/agents/components/create-agent-dialog";
import type { Agent } from "@/shared/types";

export default function DashboardPage() {
  const router = useRouter();
  const { setAgents, setLoading } = useAgentStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setLoading(true);
    api
      .get<Agent[]>("/api/agents")
      .then((agents) => setAgents(agents))
      .catch(() => {
        localStorage.removeItem("token");
        router.replace("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router, setAgents, setLoading]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/auth/login");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent">
          Foundry of Agents
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Agent
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-lg font-semibold mb-4">Your Agents</h2>
        <AgentList />
      </main>
      {showCreate && (
        <CreateAgentDialog onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
