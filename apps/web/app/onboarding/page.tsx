"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  RefreshCw,
  Sun,
  Search,
  BarChart3,
  Sprout,
  MessageSquare,
  Bell,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { agentTemplates } from "@/shared/data/templates";
import { api } from "@/shared/api/client";
import type { Agent } from "@/shared/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  RefreshCw,
  Sun,
  Search,
  BarChart3,
  Sprout,
  Sparkles,
};

const STEPS = ["Welcome", "Template", "Customize", "Notifications", "Done"];

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTemplate = searchParams.get("template");

  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    preselectedTemplate
  );
  const [agentName, setAgentName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (preselectedTemplate) {
      const tpl = agentTemplates.find((t) => t.id === preselectedTemplate);
      if (tpl) {
        setSelectedTemplate(tpl.id);
        setAgentName(tpl.name);
        setInstructions(tpl.defaultInstructions);
        setModel(tpl.defaultModel);
        setStep(1);
      }
    }
  }, [preselectedTemplate]);

  const handleSelectTemplate = (id: string) => {
    const tpl = agentTemplates.find((t) => t.id === id);
    if (tpl) {
      setSelectedTemplate(id);
      setAgentName(tpl.name);
      setInstructions(tpl.defaultInstructions);
      setModel(tpl.defaultModel);
    }
  };

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setCreating(true);
    try {
      const agent = await api.post<Agent>("/api/agents", {
        name: agentName,
        instructions: instructions || undefined,
        model,
      });
      setCreatedAgent(agent);
      setCreated(true);
    } catch {
      // If not logged in, redirect
      router.push("/auth/login");
    } finally {
      setCreating(false);
    }
  };

  const canNext = () => {
    if (step === 0) return true;
    if (step === 1) return !!selectedTemplate;
    if (step === 2) return !!agentName.trim();
    if (step === 3) return true;
    return false;
  };

  const handleNext = async () => {
    if (step === 3) {
      // On step 3 -> 4, create the agent
      await handleCreate();
      setStep(4);
    } else if (step < 4) {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Stepper */}
      <div className="border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      i < step
                        ? "bg-primary text-primary-foreground"
                        : i === step
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 hidden sm:block">
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 md:w-24 h-px mx-1 sm:mx-2 ${
                      i < step ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Let&apos;s set up your first AI agent
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Choose a template, customize it, and deploy in under a minute.
                  Your agent will be ready to chat immediately.
                </p>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="template"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Choose a Template</h2>
                  <p className="text-muted-foreground mt-1">
                    Pick a starting point for your agent
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {agentTemplates.map((tpl) => {
                    const Icon = iconMap[tpl.icon] || Sparkles;
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className={`text-left rounded-xl border p-4 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_0_20px_-5px_oklch(0.65_0.22_280_/_0.2)]"
                            : "border-border bg-card/50 hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-semibold text-sm">
                            {tpl.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tpl.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="customize"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Customize Your Agent</h2>
                  <p className="text-muted-foreground mt-1">
                    Fine-tune the name, instructions, and model
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Agent Name
                    </label>
                    <input
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="My Agent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Instructions
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="What should this agent do? How should it behave?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="claude-sonnet-4-6">
                        Claude Sonnet 4.6
                      </option>
                      <option value="claude-haiku-4-5-20251001">
                        Claude Haiku 4.5
                      </option>
                      <option value="claude-opus-4-6">Claude Opus 4.6</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Connect Notifications</h2>
                  <p className="text-muted-foreground mt-1">
                    Get alerts from your agent via Telegram
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Bell className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Telegram Alerts</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive trade notifications and daily briefings
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      1. Open Telegram and search for{" "}
                      <code className="rounded bg-secondary px-1.5 py-0.5 text-foreground">
                        @FoundryOfAgentsBot
                      </code>
                    </p>
                    <p>
                      2. Send <code className="rounded bg-secondary px-1.5 py-0.5 text-foreground">/start</code> to the bot
                    </p>
                    <p>
                      3. Copy the chat ID and add it in Settings after setup
                    </p>
                  </div>
                  <p className="mt-6 text-xs text-muted-foreground">
                    You can skip this step and configure notifications later in
                    Settings.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold">Your agent is ready!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {created && createdAgent
                    ? `"${createdAgent.name}" has been deployed. Start chatting with it now.`
                    : creating
                      ? "Creating your agent..."
                      : "Sign in first to create your agent."}
                </p>
                {created && createdAgent && (
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/agents/${createdAgent.id}`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {!created && !creating && (
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Sign In to Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="border-t border-border px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext() || creating}
              className="flex items-center gap-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {step === 3 ? (creating ? "Creating..." : "Create Agent") : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
