'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, Clock, Mail, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const STATS_KEY = 'forge-admin-2026';

interface Visitor {
  id: string;
  email: string | null;
  ip_address: string | null;
  visit_count: number;
  total_time_seconds: number;
  sections_viewed: string[];
  deepest_section: string | null;
  first_visit: string;
  last_visit: string;
}

interface Stats {
  summary: { total_visitors: number; total_emails: number; avg_time_seconds: number };
  visitors: Visitor[];
  section_counts: Record<string, number>;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function SummaryCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-zinc-500" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-light text-zinc-100">{value}</div>
    </div>
  );
}

function SectionBar({ name, count, max }: { name: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 w-20 text-right capitalize">{name}</span>
      <div className="flex-1 h-6 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="h-full rounded" style={{ width: `${pct}%`, background: 'rgba(124,58,237,0.4)', minWidth: count > 0 ? 4 : 0, transition: 'width 0.5s ease' }} />
      </div>
      <span className="text-xs text-zinc-500 w-8">{count}</span>
    </div>
  );
}

export default function DataRoomPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'last_visit' | 'total_time' | 'visits'>('last_visit');

  useEffect(() => {
    if (localStorage.getItem('dr-admin-auth') === 'true') setAuthenticated(true);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dataroom/stats?key=${STATS_KEY}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    document.title = 'Forge — Data Room Analytics';
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const sortedVisitors = stats?.visitors?.slice().sort((a, b) => {
    if (sortBy === 'last_visit') return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime();
    if (sortBy === 'total_time') return b.total_time_seconds - a.total_time_seconds;
    return b.visit_count - a.visit_count;
  }) || [];

  const sectionMax = stats?.section_counts ? Math.max(...Object.values(stats.section_counts), 1) : 1;

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-sm p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
          <h2 className="text-lg font-medium text-zinc-100 mb-4">Admin Access</h2>
          <form onSubmit={(e) => { e.preventDefault(); if (password === 'tenx123') { setAuthenticated(true); localStorage.setItem('dr-admin-auth', 'true'); } else { setAuthError('Invalid password'); } }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" autoFocus
              className="w-full rounded-lg px-3 py-2 text-sm text-zinc-200 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
            {authError && <p className="text-xs text-red-400 mb-3">{authError}</p>}
            <button type="submit" className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">Access</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-light text-zinc-100">Data Room Analytics</h1>
          <a href="https://forge-of-agents.vercel.app/dataroom" target="_blank" rel="noopener noreferrer"
             className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1">
            forge-of-agents.vercel.app/dataroom <ExternalLink size={10} />
          </a>
        </div>
        <span className="text-[10px] text-zinc-600">Auto-refreshes every 30s</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={Users} label="Total Visits" value={String(stats?.summary?.total_visitors || 0)} />
        <SummaryCard icon={Mail} label="Emails Captured" value={String(stats?.summary?.total_emails || 0)} />
        <SummaryCard icon={Clock} label="Avg Time" value={formatTime(stats?.summary?.avg_time_seconds || 0)} />
        <SummaryCard icon={BarChart3} label="Visitors Today" value={String(
          sortedVisitors.filter(v => new Date(v.last_visit).toDateString() === new Date().toDateString()).length
        )} />
      </div>

      {/* Visitor Table */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-200">Visitors</span>
            <div className="flex gap-2">
              {(['last_visit', 'total_time', 'visits'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`text-[10px] px-2 py-1 rounded ${sortBy === s ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-500 hover:text-zinc-300'} transition-colors`}>
                  {s === 'last_visit' ? 'Recent' : s === 'total_time' ? 'Time' : 'Visits'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {sortedVisitors.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">No visitors yet</div>
          ) : sortedVisitors.map(v => {
            const sectionCount = v.sections_viewed?.length || 0;
            const dotColor = sectionCount >= 5 ? 'bg-emerald-400' : sectionCount >= 2 ? 'bg-amber-400' : 'bg-red-400';
            const isExpanded = expanded === v.id;
            return (
              <div key={v.id}>
                <button onClick={() => setExpanded(isExpanded ? null : v.id)}
                  className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors">
                  <div className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-zinc-200">{v.email || '(no email)'}</span>
                  </div>
                  <span className="text-xs text-zinc-500 w-12 text-right">{v.visit_count}x</span>
                  <span className="text-xs text-zinc-400 w-20 text-right">{formatTime(v.total_time_seconds)}</span>
                  <span className="text-xs text-zinc-500 w-20 text-right hidden sm:block">{sectionCount} sections</span>
                  <span className="text-xs text-zinc-600 w-16 text-right hidden md:block">{formatRelative(v.last_visit)}</span>
                  {isExpanded ? <ChevronUp size={14} className="text-zinc-600" /> : <ChevronDown size={14} className="text-zinc-600" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3 pl-10 space-y-1">
                    <div className="text-[10px] text-zinc-600">
                      First visit: {new Date(v.first_visit).toLocaleString()} · Last: {new Date(v.last_visit).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      Sections: {v.sections_viewed?.length > 0 ? v.sections_viewed.join(' → ') : 'None'}
                    </div>
                    {v.deepest_section && (
                      <div className="text-[10px] text-zinc-600">Deepest: {v.deepest_section}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Heatmap */}
      {stats?.section_counts && Object.keys(stats.section_counts).length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
          <h3 className="text-sm font-medium text-zinc-200 mb-4">Section Views</h3>
          <div className="space-y-2">
            {Object.entries(stats.section_counts)
              .sort(([,a], [,b]) => b - a)
              .map(([name, count]) => (
                <SectionBar key={name} name={name} count={count} max={sectionMax} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
