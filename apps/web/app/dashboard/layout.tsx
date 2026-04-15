"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  Plus,
  Puzzle,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Network,
  BarChart3,
} from "lucide-react";
import { api } from "@/shared/api/client";
import { useAgentStore } from "@/features/agents/store";
import { useAuthStore } from "@/features/auth/store";
import type { Agent } from "@/shared/types";
import { AgentAvatar } from "@/shared/components/agent-avatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { agents, setAgents, setLoading } = useAgentStore();
  const { user, logout, initialize } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    initialize();
    setLoading(true);

    Promise.all([
      api.get<Agent[]>("/api/agents"),
      api.get<{ id: string; email: string; name: string }>("/api/auth/me").catch(() => null),
    ])
      .then(([agentsList, me]) => {
        setAgents(agentsList);
        if (me) {
          useAuthStore.setState({
            user: { id: me.id, email: me.email, name: me.name },
            isAuthenticated: true,
          });
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.replace("/auth/login");
      })
      .finally(() => {
        setLoading(false);
        setInitialized(true);
      });
  }, [router, setAgents, setLoading, initialize]);

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isAgentActive = (agentId: string) =>
    pathname.includes(`/dashboard/agents/${agentId}`);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] flex flex-col border-r border-border bg-card transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
          >
            <img src="/logo.png" alt="Forge" className="w-6 h-6" />
            <span className="text-sm font-semibold tracking-tight text-zinc-100">Forge <span className="text-zinc-500 font-normal">of Agents</span></span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Agents
            </span>
          </div>
          <div className="space-y-1">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={pathname.startsWith('/dashboard/canvas') ? `/dashboard/canvas?agent=${agent.id}` : `/dashboard/agents/${agent.id}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isAgentActive(agent.id)
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <AgentAvatar emoji={agent.avatar_url} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{agent.name}</p>
                  {agent.team_count && agent.team_count > 0 && (
                    <p className="text-[10px] text-muted-foreground/60">{agent.team_count} specialist{agent.team_count > 1 ? 's' : ''}</p>
                  )}
                </div>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    agent.status === "idle"
                      ? "bg-green-400"
                      : agent.status === "working"
                        ? "bg-blue-400"
                        : "bg-zinc-500"
                  }`}
                />
              </Link>
            ))}
          </div>
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors mt-1"
          >
            <Plus className="w-4 h-4" />
            New Agent
          </Link>
        </div>

        {/* Nav */}
        <div className="border-t border-border px-3 py-3 space-y-1">
          <Link
            href="/dashboard/canvas"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              pathname.startsWith("/dashboard/canvas")
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Network className="w-4 h-4" />
            Canvas
          </Link>
          <Link
            href="/dashboard/skills"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              pathname === "/dashboard/skills"
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Puzzle className="w-4 h-4" />
            Skills
          </Link>
          <Link
            href="/dashboard/documents"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              pathname === "/dashboard/documents"
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              pathname === "/dashboard/settings"
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <Link
            href="/dashboard/dataroom"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              pathname === "/dashboard/dataroom"
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Data Room
          </Link>
        </div>

        {/* User */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
              {user?.name?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || user?.email || "User"}
              </p>
              {user?.name && user?.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Forge" className="w-6 h-6" />
            <span className="text-sm font-semibold tracking-tight text-zinc-100">Forge <span className="text-zinc-500 font-normal">of Agents</span></span>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
