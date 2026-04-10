"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-6">Settings</h2>
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Settings className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Settings coming soon.</p>
      </div>
    </div>
  );
}
