"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/store";

interface NotifPref {
  id: string;
  channel: string;
  channel_config: { chat_id?: string };
  enabled: boolean;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [chatId, setChatId] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [testError, setTestError] = useState("");

  useEffect(() => {
    api
      .get<NotifPref[]>("/api/notifications/preferences")
      .then((prefs) => {
        const tg = prefs.find((p) => p.channel === "telegram");
        if (tg?.channel_config?.chat_id) {
          setChatId(tg.channel_config.chat_id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await api.post("/api/notifications/preferences", {
        channel: "telegram",
        config: { chat_id: chatId },
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestStatus("idle");
    setTestError("");
    try {
      await api.post("/api/notifications/test", {
        channel: "telegram",
        message: "Test from Foundry of Agents!",
      });
      setTestStatus("success");
      setTimeout(() => setTestStatus("idle"), 3000);
    } catch (err) {
      setTestStatus("error");
      setTestError(err instanceof Error ? err.message : "Failed to send test");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>

      {/* Workspace */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Workspace</h3>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Workspace Name</label>
          <input
            type="text"
            defaultValue="My Workspace"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="My Workspace"
          />
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Profile</h3>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Email</label>
          <input
            type="email"
            disabled
            value={user?.email || ""}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
            placeholder="your@email.com"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Timezone</label>
          <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern (ET)</option>
            <option value="America/Chicago">Central (CT)</option>
            <option value="America/Denver">Mountain (MT)</option>
            <option value="America/Los_Angeles">Pacific (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Berlin">Berlin (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Singapore">Singapore (SGT)</option>
          </select>
        </div>
      </div>

      {/* Notifications — Telegram */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
            <Send className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Telegram Notifications</h3>
            <p className="text-xs text-muted-foreground">Receive alerts from your agents via Telegram</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Chat ID</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="123456789"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Message @FoundryOfAgentsBot on Telegram with /start to get your chat ID
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !chatId.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !chatId.trim()}
              className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-accent/50 transition-colors disabled:opacity-50"
            >
              {testing ? "Sending..." : "Send Test"}
            </button>
            {saveStatus === "success" && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" /> Failed to save
              </span>
            )}
            {testStatus === "success" && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle2 className="w-3 h-3" /> Sent!
              </span>
            )}
            {testStatus === "error" && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" /> {testError || "Failed"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete Workspace</p>
            <p className="text-xs text-muted-foreground">Permanently delete this workspace and all its data</p>
          </div>
          <button
            disabled
            className="rounded-lg border border-red-500/30 px-4 py-2 text-xs font-medium text-red-400 opacity-50 cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-12 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <a href="/dashboard/dataroom" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
          Admin Panel
        </a>
      </div>
    </div>
  );
}
