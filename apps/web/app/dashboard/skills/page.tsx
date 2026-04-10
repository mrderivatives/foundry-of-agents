"use client";

import { useEffect, useState } from "react";
import { api } from "@/shared/api/client";

interface Skill {
  id: string;
  workspace_id: string | null;
  name: string;
  description: string | null;
  content: string;
  is_builtin: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", content: "", category: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = () => {
    api
      .get<Skill[]>("/api/skills")
      .then(setSkills)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.name || !form.content) return;
    setCreating(true);
    try {
      await api.post("/api/skills", form);
      setShowForm(false);
      setForm({ name: "", description: "", content: "", category: "" });
      loadSkills();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    research: "bg-blue-500/10 text-blue-400",
    crypto: "bg-amber-500/10 text-amber-400",
    productivity: "bg-green-500/10 text-green-400",
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Skills</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create Skill
        </button>
      </div>
        {showForm && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold">New Skill</h2>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Category (e.g. research, crypto, productivity)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Skill content (instructions for the agent)"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !form.name || !form.content}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills yet.</p>
        ) : (
          <div className="grid gap-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="rounded-xl border border-border bg-card p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{skill.name}</h3>
                  {skill.is_builtin && (
                    <span className="rounded-full bg-violet-500/10 text-violet-400 px-2 py-0.5 text-xs">
                      built-in
                    </span>
                  )}
                  {skill.category && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        categoryColors[skill.category] || "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {skill.category}
                    </span>
                  )}
                </div>
                {skill.description && (
                  <p className="text-sm text-muted-foreground">{skill.description}</p>
                )}
                <p className="text-xs text-muted-foreground/60 line-clamp-2">
                  {skill.content}
                </p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
