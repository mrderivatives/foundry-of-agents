"use client";

import { useEffect, useState } from "react";
import { api } from "@/shared/api/client";

interface Document {
  id: string;
  workspace_id: string;
  filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  status: string;
  total_chunks: number | null;
  created_at: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = () => {
    api
      .get<Document[]>("/api/documents")
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    setCreating(true);
    try {
      await api.post("/api/documents", form);
      setShowForm(false);
      setForm({ title: "", content: "" });
      loadDocs();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/documents/${id}`);
      setDocs(docs.filter((d) => d.id !== id));
    } catch {
      // ignore
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Add Document
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">New Document</h2>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Paste document content here..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={10}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !form.title || !form.content}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {creating ? "Uploading..." : "Upload"}
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

      {docs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents yet. Add one to give your agents context.</p>
      ) : (
        <div className="grid gap-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="font-medium truncate">{doc.filename || "Untitled"}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatSize(doc.size_bytes)}</span>
                  <span>{doc.total_chunks} chunk{doc.total_chunks !== 1 ? "s" : ""}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      doc.status === "ready"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {doc.status}
                  </span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="ml-4 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
