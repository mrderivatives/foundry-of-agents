'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReactFlow, Panel, Controls, Background, Handle, Position, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './canvas.css';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, BASE_URL } from '@/shared/api/client';
import { Search, BarChart3, Globe, FileText, Brain, Clock, Send, MessageSquare, Bell, Zap, Wallet, LayoutList, Shield, Plus, ChevronDown, ChevronUp, Scroll, Cpu, FolderKanban, BookOpen, Mail, X, Loader2, Check, Trash2, Users, Copy, ExternalLink } from 'lucide-react';
import type { Agent } from '@/shared/types';

// --- Custom Node Components ---

function CategoryNode({ data }: any) {
  return (
    <div style={{ padding: '0 0 4px 0' }}>
      <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#52525b' }}>
        {data.label}
      </span>
    </div>
  );
}

function AgentNode({ data }: { data: any }) {
  const statusColor = data.status === 'working' ? 'bg-blue-400 animate-pulse' : data.status === 'idle' ? 'bg-emerald-400' : 'bg-zinc-600';
  return (
    <div
      style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', minWidth: 180, backdropFilter: 'blur(8px)', cursor: data.agentId ? 'pointer' : 'default' }}>
      <Handle type='target' position={Position.Top} style={{ background: '#7c3aed', border: 'none', width: 8, height: 8 }} />
      <div className='flex items-center gap-3'>
        {data.avatarUrl ? (
          <img src={data.avatarUrl} alt='' className='w-10 h-10 rounded-full object-cover' style={{ boxShadow: `0 0 12px ${data.accentColor || '#7c3aed'}40`, border: '2px solid rgba(255,255,255,0.1)' }} />
        ) : (
          <div className='w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30' />
        )}
        <div className='flex-1 min-w-0'>
          <div className='text-sm font-medium text-zinc-100 truncate'>{data.name}</div>
          <div className='text-[11px] text-zinc-500 truncate'>{data.role}</div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
      </div>
      <Handle type='source' position={Position.Bottom} style={{ background: '#7c3aed', border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

const TOOL_ICONS: Record<string, any> = {
  'web_search': Search, 'web-search': Search,
  'wallet_propose': Shield, 'wallet': Shield,
  'memory_read': Brain, 'memory': Brain,
  'soul': Scroll,
  'documents': FileText,
  'llm': Cpu,
  'cron': Clock,
  'projects': FolderKanban,
  'research': BookOpen,
  'price-check': BarChart3, 'price_check': BarChart3,
  'portfolio-tracker': BarChart3,
  'document-analyzer': FileText, 'document_search': FileText,
  'morning-brief': Zap,
  'toggle': ChevronDown,
  default: Globe,
};

function ToolNode({ data }: { data: any }) {
  const Icon = TOOL_ICONS[data.toolId] || TOOL_ICONS.default;

  if (data.isToggle) {
    return (
      <div style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', minWidth: 110, cursor: 'pointer' }}>
        <div className='flex items-center gap-1.5'>
          <ChevronDown size={12} className='text-zinc-600' style={{ transform: data.name === 'Show less' ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
          <div className='text-[11px] text-zinc-600'>{data.name}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', minWidth: 130, cursor: 'pointer' }}>
      <Handle type='target' position={Position.Top} style={{ background: '#a78bfa', border: 'none', width: 6, height: 6 }} />
      <div className='flex items-center gap-2'>
        <div className='w-7 h-7 rounded flex items-center justify-center' style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <Icon size={14} className='text-violet-400' />
        </div>
        <div className='text-xs text-zinc-400'>{data.name}</div>
      </div>
      {data.badge > 0 && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          width: 18, height: 18, borderRadius: '50%',
          background: '#7c3aed', color: '#fff',
          fontSize: 10, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {data.badge}
        </span>
      )}
    </div>
  );
}

function TriggerNode({ data }: { data: any }) {
  return (
    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', minWidth: 140, cursor: 'pointer' }}>
      <div className='flex items-center gap-2'>
        <Clock size={14} className='text-amber-400' />
        <div>
          <div className='text-xs text-zinc-300'>{data.name}</div>
          <div className='text-[10px] text-zinc-600'>{data.schedule}</div>
        </div>
      </div>
      <Handle type='source' position={Position.Right} style={{ background: '#f59e0b', border: 'none', width: 6, height: 6 }} />
    </div>
  );
}

const OUTPUT_ICONS: Record<string, any> = {
  'chat': MessageSquare,
  'telegram': Send,
  'email': Mail,
  'api': Globe,
};

function OutputNode({ data }: { data: any }) {
  const Icon = OUTPUT_ICONS[data.channel] || MessageSquare;
  return (
    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', minWidth: 120, cursor: 'pointer' }}>
      <Handle type='target' position={Position.Top} style={{ background: '#a78bfa', border: 'none', width: 6, height: 6 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color='#a78bfa' />
        </div>
        <span style={{ fontSize: 12, color: '#a1a1aa' }}>{data.name}</span>
      </div>
    </div>
  );
}

const nodeTypes = { agent: AgentNode, tool: ToolNode, trigger: TriggerNode, output: OutputNode, category: CategoryNode };

// --- Character image mapping ---
function getAvatarUrl(agent: any): string {
  if (agent.avatar_url && agent.avatar_url.startsWith('/')) return agent.avatar_url;
  return '/characters/char-commander.png';
}

// --- Shared styles ---
const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };
const inputClass = 'w-full rounded-lg px-3 py-2 text-sm text-zinc-200';

// --- Main Page ---
export default function CanvasPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agentId = searchParams.get('agent');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [agentName, setAgentName] = useState('');
  const [leftExpanded, setLeftExpanded] = useState(false);
  const [openModal, setOpenModal] = useState<string | null>(null);

  // Modal state
  const [modalData, setModalData] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cron form state
  const [newCronName, setNewCronName] = useState('');
  const [newCronExpr, setNewCronExpr] = useState('');
  const [newCronPrompt, setNewCronPrompt] = useState('');

  const [badges, setBadges] = useState<Record<string, number>>({});

  // Auto-select first agent if none specified
  useEffect(() => {
    if (!agentId) {
      api.get<Agent[]>('/api/agents').then(agents => {
        if (agents.length > 0) {
          router.replace(`/dashboard/canvas?agent=${agents[0].id}`);
        } else {
          setLoading(false);
        }
      }).catch(() => setLoading(false));
    }
  }, [agentId, router]);

  const loadCanvasData = useCallback(async () => {
    if (!agentId) return;
    try {
      const agent = await api.get<any>(`/api/agents/${agentId}`);
      setAgentName(agent.name || '');
      let team: any[] = [];
      try { team = await api.get<any[]>(`/api/agents/${agentId}/team`); } catch {}

      // Fetch badge counts
      Promise.all([
        api.get<any[]>('/api/documents').then(d => d?.length || 0).catch(() => 0),
        api.get<any[]>(`/api/agents/${agentId}/memory`).then(m => m?.length || 0).catch(() => 0),
        api.get<any[]>(`/api/agents/${agentId}/cron-jobs`).then(c => c?.length || 0).catch(() => 0),
      ]).then(([docs, mems, crons]) => {
        setBadges({ docs, mems, crons });
      });

      const n: Node[] = [];
      const e: Edge[] = [];

      // --- Category Headers ---
      n.push({ id: 'cat-tools', type: 'category', position: { x: 60, y: 15 }, data: { label: 'Tools & Settings' }, draggable: false, selectable: false });
      n.push({ id: 'cat-tasks', type: 'category', position: { x: 740, y: 15 }, data: { label: 'Tasks & Objectives' }, draggable: false, selectable: false });
      n.push({ id: 'cat-coms', type: 'category', position: { x: 380, y: 440 }, data: { label: 'Coms & Resources' }, draggable: false, selectable: false });

      // --- LEFT: Tools & Settings (collapsible) ---
      const alwaysVisibleTools = [
        { id: 'tool-soul', name: 'Soul / Mission', toolId: 'soul', y: 55 },
        { id: 'tool-documents', name: 'Documents', toolId: 'documents', y: 115, badge: badges.docs },
        { id: 'tool-wallet', name: 'Wallet', toolId: 'wallet_propose', y: 175 },
      ];

      alwaysVisibleTools.forEach(t => {
        n.push({ id: t.id, type: 'tool', position: { x: 60, y: t.y }, data: { name: t.name, toolId: t.toolId, badge: (t as any).badge } });
        e.push({ id: `e-${t.id}-lead`, source: t.id, target: agent.id, type: 'default',
          style: { stroke: 'rgba(124,58,237,0.15)', strokeWidth: 1, strokeDasharray: '4' } });
      });

      // Toggle node
      n.push({ id: 'tool-toggle', type: 'tool', position: { x: 60, y: 235 }, data: { name: leftExpanded ? 'Show less' : 'More tools...', toolId: 'toggle', isToggle: true } });

      // Extra tools when expanded
      if (leftExpanded) {
        const expandedTools = [
          { id: 'tool-web-search', name: 'Web Search', toolId: 'web_search', y: 295 },
          { id: 'tool-llm', name: 'LLM Selection', toolId: 'llm', y: 355 },
          { id: 'tool-memory', name: 'Memory', toolId: 'memory_read', y: 415, badge: badges.mems },
        ];
        expandedTools.forEach(t => {
          n.push({ id: t.id, type: 'tool', position: { x: 60, y: t.y }, data: { name: t.name, toolId: t.toolId, badge: (t as any).badge } });
          e.push({ id: `e-${t.id}-lead`, source: t.id, target: agent.id, type: 'default',
            style: { stroke: 'rgba(124,58,237,0.15)', strokeWidth: 1, strokeDasharray: '4' } });
        });
      }

      // --- CENTER: Lead Agent ---
      const leadY = 180;
      n.push({ id: agent.id, type: 'agent', position: { x: 420, y: leadY },
        data: { name: agent.name, role: 'Lead', avatarUrl: getAvatarUrl(agent), accentColor: '#7c3aed', status: agent.status || 'idle', agentId: agent.id } });

      // Specialists below lead
      const specGap = 180;
      const specStartX = 420 - ((team.length - 1) * specGap) / 2;
      team.forEach((sub: any, i: number) => {
        n.push({ id: sub.id, type: 'agent', position: { x: specStartX + i * specGap, y: leadY + 130 },
          data: { name: sub.name, role: sub.description || 'Specialist', avatarUrl: getAvatarUrl(sub), accentColor: '#a78bfa', status: sub.status || 'idle', agentId: sub.id } });
        e.push({ id: `e-lead-${sub.id}`, source: agent.id, target: sub.id, animated: true,
          style: { stroke: 'rgba(124,58,237,0.35)', strokeWidth: 2 } });
      });

      // --- RIGHT: Tasks & Objectives ---
      const rightTasks = [
        { id: 'task-scheduled', name: 'Scheduled Tasks', toolId: 'cron', badge: badges.crons },
        { id: 'task-projects', name: 'Projects', toolId: 'projects' },
        { id: 'task-research', name: 'Research', toolId: 'research' },
      ];
      rightTasks.forEach((t, i) => {
        n.push({ id: t.id, type: 'tool', position: { x: 740, y: 50 + i * 62 }, data: { name: t.name, toolId: t.toolId, badge: (t as any).badge } });
        e.push({ id: `e-lead-${t.id}`, source: agent.id, target: t.id,
          style: { stroke: 'rgba(245,158,11,0.15)', strokeWidth: 1, strokeDasharray: '4' } });
      });

      // --- BOTTOM: Coms & Resources ---
      const comItems = [
        { id: 'com-chat', name: 'Chat', channel: 'chat' },
        { id: 'com-messaging', name: 'Messaging', channel: 'telegram' },
        { id: 'com-email', name: 'Email', channel: 'email' },
        { id: 'com-apis', name: 'APIs', channel: 'api' },
      ];
      const comStartX = 420 - ((comItems.length - 1) * 140) / 2;
      comItems.forEach((c, i) => {
        n.push({ id: c.id, type: 'output', position: { x: comStartX + i * 140, y: 475 }, data: { name: c.name, channel: c.channel } });
        e.push({ id: `e-lead-${c.id}`, source: agent.id, target: c.id,
          style: { stroke: 'rgba(124,58,237,0.2)', strokeWidth: 1.5 } });
      });

      setNodes(n);
      setEdges(e);
    } catch (err) {
      console.error('Canvas load error', err);
    } finally {
      setLoading(false);
    }
  }, [agentId, leftExpanded, badges]);

  useEffect(() => {
    loadCanvasData();
  }, [loadCanvasData]);

  // --- Fetch modal data when a modal opens ---
  useEffect(() => {
    if (!openModal) {
      setModalData(null);
      setModalError(null);
      setSaveSuccess(false);
      return;
    }

    setModalLoading(true);
    setModalError(null);
    setModalData(null);
    setSaveSuccess(false);

    (async () => {
      try {
        switch (openModal) {
          case 'tool-soul': {
            const agent = await api.get<any>(`/api/agents/${agentId}`);
            setModalData({ name: agent.name || '', instructions: agent.instructions || '', model: agent.model || 'claude-sonnet-4-6' });
            break;
          }
          case 'tool-documents': {
            const docs = await api.get<any[]>('/api/documents').catch(() => []);
            setModalData({ documents: docs || [] });
            break;
          }
          case 'tool-wallet': {
            const [walletInfo, balance] = await Promise.all([
              api.get<any>(`/api/agents/${agentId}/wallet`).catch(() => null),
              api.get<any>(`/api/agents/${agentId}/wallet/balance`).catch(() => null),
            ]);
            setModalData({
              wallet: walletInfo?.wallet || null,
              policy: walletInfo?.policy || { daily_limit_usd: 50, per_tx_limit_usd: 25 },
              balance: balance,
            });
            break;
          }
          case 'tool-llm': {
            const agent = await api.get<any>(`/api/agents/${agentId}`);
            setModalData({ model: agent.model || 'claude-sonnet-4-6' });
            break;
          }
          case 'tool-memory': {
            const mems = await api.get<any[]>(`/api/agents/${agentId}/memory`).catch(() => []);
            setModalData({ memories: mems || [] });
            break;
          }
          case 'task-scheduled': {
            const jobs = await api.get<any[]>(`/api/agents/${agentId}/cron-jobs`).catch(() => []);
            setModalData({ cronJobs: jobs || [] });
            break;
          }
          case 'com-messaging': {
            const prefs = await api.get<any[]>('/api/notifications/preferences').catch(() => []);
            const telegramPref = Array.isArray(prefs) ? prefs.find((p: any) => p.channel === 'telegram') : null;
            setModalData({ chatId: telegramPref?.config?.chat_id || '' });
            break;
          }
          default:
            setModalData({});
        }
      } catch (err: any) {
        setModalError(err.message || 'Failed to load data');
      } finally {
        setModalLoading(false);
      }
    })();
  }, [openModal, agentId]);

  // --- Save handlers ---
  const handleSave = async (saveFn: () => Promise<void>) => {
    setSaving(true);
    setModalError(null);
    try {
      await saveFn();
      setSaveSuccess(true);
      setTimeout(() => {
        setOpenModal(null);
        loadCanvasData();
      }, 600);
    } catch (err: any) {
      setModalError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveSoul = () => handleSave(async () => {
    await api.patch(`/api/agents/${agentId}`, { name: modalData.name, instructions: modalData.instructions });
  });

  const saveWalletPolicy = () => handleSave(async () => {
    await api.patch(`/api/agents/${agentId}/wallet/policy`, {
      daily_limit_usd: modalData.policy?.daily_limit_usd,
      per_tx_limit_usd: modalData.policy?.per_tx_limit_usd,
    });
  });

  const saveLLM = () => handleSave(async () => {
    await api.patch(`/api/agents/${agentId}`, { model: modalData.model });
  });

  const uploadDoc = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await fetch(`${BASE_URL}/api/documents/upload`, { method: 'POST', headers, body: fd });
    const docs = await api.get<any[]>('/api/documents').catch(() => []);
    setModalData({ documents: docs || [] });
  };

  const deleteDoc = async (docId: string) => {
    await api.delete(`/api/documents/${docId}`);
    setModalData((prev: any) => ({ ...prev, documents: prev.documents.filter((d: any) => d.id !== docId) }));
  };

  const createCron = async () => {
    if (!newCronName || !newCronExpr || !newCronPrompt) return;
    await api.post(`/api/agents/${agentId}/cron-jobs`, {
      name: newCronName, cron_expression: newCronExpr, prompt: newCronPrompt,
      timezone: 'UTC', enabled: true,
    });
    const jobs = await api.get<any[]>(`/api/agents/${agentId}/cron-jobs`).catch(() => []);
    setModalData({ cronJobs: jobs || [] });
    setNewCronName('');
    setNewCronExpr('');
    setNewCronPrompt('');
  };

  const deleteCron = async (cronId: string) => {
    await api.delete(`/api/cron-jobs/${cronId}`);
    const jobs = await api.get<any[]>(`/api/agents/${agentId}/cron-jobs`).catch(() => []);
    setModalData({ cronJobs: jobs || [] });
  };

  const saveMessaging = () => handleSave(async () => {
    await api.post('/api/notifications/preferences', { channel: 'telegram', config: { chat_id: modalData.chatId } });
  });

  const testTelegram = async () => {
    try {
      await api.post('/api/notifications/test', { channel: 'telegram', message: '🔔 Test from Forge!' });
    } catch (err: any) {
      setModalError(err.message || 'Test message failed');
    }
  };

  // --- Modal content renderer ---
  function renderModalContent(modalId: string) {
    const modalMeta: Record<string, { title: string; icon: React.ReactNode; hasActions?: boolean }> = {
      'tool-soul': { title: 'Soul / Mission', icon: <Scroll size={18} className="text-violet-400" />, hasActions: true },
      'tool-documents': { title: 'Documents', icon: <FileText size={18} className="text-violet-400" /> },
      'tool-wallet': { title: 'Wallet Settings', icon: <Shield size={18} className="text-violet-400" />, hasActions: true },
      'tool-web-search': { title: 'Web Search', icon: <Search size={18} className="text-violet-400" /> },
      'tool-llm': { title: 'LLM Selection', icon: <Cpu size={18} className="text-violet-400" />, hasActions: true },
      'tool-memory': { title: 'Memory', icon: <Brain size={18} className="text-violet-400" /> },
      'task-scheduled': { title: 'Scheduled Tasks', icon: <Clock size={18} className="text-amber-400" /> },
      'task-projects': { title: 'Projects', icon: <FolderKanban size={18} className="text-amber-400" /> },
      'task-research': { title: 'Research', icon: <BookOpen size={18} className="text-amber-400" /> },
      'com-chat': { title: 'Chat', icon: <MessageSquare size={18} className="text-violet-400" /> },
      'com-messaging': { title: 'Messaging (Telegram)', icon: <Send size={18} className="text-violet-400" />, hasActions: true },
      'com-email': { title: 'Email', icon: <Mail size={18} className="text-violet-400" /> },
      'com-apis': { title: 'APIs', icon: <Globe size={18} className="text-violet-400" /> },
    };

    const meta = modalMeta[modalId];
    if (!meta) return null;

    const onSave = modalId === 'tool-soul' ? saveSoul
      : modalId === 'tool-wallet' ? saveWalletPolicy
      : modalId === 'tool-llm' ? saveLLM
      : modalId === 'com-messaging' ? saveMessaging
      : undefined;

    return (
      <>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              {meta.icon}
            </div>
            <h2 className="text-lg font-medium text-zinc-100">{meta.title}</h2>
          </div>
          <button onClick={() => setOpenModal(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Loading */}
        {modalLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="text-violet-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {modalError && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {modalError}
          </div>
        )}

        {/* Content */}
        {!modalLoading && renderModalBody(modalId)}

        {/* Footer with Save */}
        {!modalLoading && onSave && (
          <div className="flex items-center justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {saveSuccess && <span className="text-xs text-emerald-400 flex items-center gap-1"><Check size={14} /> Saved!</span>}
            <button onClick={() => setOpenModal(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Cancel</button>
            <button onClick={onSave} disabled={saving} className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        )}

        {/* Footer without Save */}
        {!modalLoading && !onSave && (
          <div className="flex justify-end mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => setOpenModal(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Close</button>
          </div>
        )}
      </>
    );
  }

  function renderModalBody(modalId: string) {
    switch (modalId) {
      case 'tool-soul':
        return modalData ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Agent Name</label>
              <input className={inputClass} style={inputStyle}
                     value={modalData.name}
                     onChange={e => setModalData((p: any) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Mission / Instructions</label>
              <textarea className={`${inputClass} h-32 resize-none`} style={inputStyle}
                        value={modalData.instructions}
                        onChange={e => setModalData((p: any) => ({ ...p, instructions: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Personality</label>
              <select className={inputClass} style={inputStyle}>
                <option>Professional</option><option>Friendly</option><option>Technical</option><option>Creative</option>
              </select>
            </div>
          </div>
        ) : null;

      case 'tool-documents':
        return modalData ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">Documents that provide context to your agent.</p>
            {modalData.documents.length === 0 ? (
              <div className="px-3 py-6 rounded-lg text-center text-sm text-zinc-500" style={{ ...inputStyle }}>
                No documents uploaded
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {modalData.documents.map((doc: any) => (
                  <div key={doc.id} className="px-3 py-2 rounded-lg flex items-center justify-between" style={inputStyle}>
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-zinc-500 shrink-0" />
                      <span className="text-sm text-zinc-300 truncate">{doc.name || doc.filename}</span>
                    </div>
                    <button onClick={() => deleteDoc(doc.id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0 ml-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileInputRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadDoc(e.target.files[0]); }} />
            <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
              + Upload Document
            </button>
          </div>
        ) : null;

      case 'tool-wallet':
        return modalData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Status</span>
              <span className={`text-xs ${modalData.wallet ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {modalData.wallet ? modalData.wallet.status || 'Active' : 'No wallet'}
              </span>
            </div>

            {/* Deposit Address */}
            {modalData.wallet?.public_key && (
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Deposit Address</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg text-xs text-zinc-300 font-mono truncate" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {modalData.wallet.public_key}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(modalData.wallet.public_key)}
                    className="px-2 py-2 rounded-lg hover:bg-white/[0.06] transition-colors" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Copy size={14} className="text-zinc-400" />
                  </button>
                  <a href={`https://solscan.io/account/${modalData.wallet.public_key}`} target="_blank" rel="noopener noreferrer"
                    className="px-2 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-zinc-400 hover:text-zinc-200" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}

            {/* Balances */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Balances</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[10px] text-zinc-500">SOL</div>
                  <div className="text-sm font-medium text-zinc-200">{modalData.balance?.sol?.amount ?? '0.0000'}</div>
                  <div className="text-[10px] text-zinc-600">${modalData.balance?.sol?.usd_value ?? '0.00'}</div>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[10px] text-zinc-500">USDC</div>
                  <div className="text-sm font-medium text-zinc-200">{modalData.balance?.usdc?.amount ?? '0.00'}</div>
                  <div className="text-[10px] text-zinc-600">${modalData.balance?.usdc?.usd_value ?? '0.00'}</div>
                </div>
              </div>
              {modalData.balance?.total_usd && (
                <div className="text-right text-[10px] text-zinc-600">≈ ${modalData.balance.total_usd} total</div>
              )}
            </div>

            {/* Spending Limits */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Daily Limit ($)</label>
              <input type="number" className={inputClass} style={inputStyle}
                     value={modalData.policy?.daily_limit_usd ?? 50}
                     onChange={e => setModalData((p: any) => ({ ...p, policy: { ...p.policy, daily_limit_usd: Number(e.target.value) } }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Per-TX Limit ($)</label>
              <input type="number" className={inputClass} style={inputStyle}
                     value={modalData.policy?.per_tx_limit_usd ?? 25}
                     onChange={e => setModalData((p: any) => ({ ...p, policy: { ...p.policy, per_tx_limit_usd: Number(e.target.value) } }))} />
            </div>

            {/* Allowed Tokens */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Allowed Tokens</label>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded text-xs text-zinc-300" style={{ background: 'rgba(255,255,255,0.05)' }}>SOL</span>
                <span className="px-2 py-1 rounded text-xs text-zinc-300" style={{ background: 'rgba(255,255,255,0.05)' }}>USDC</span>
              </div>
            </div>
          </div>
        ) : null;

      case 'tool-web-search':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-sm text-zinc-300">Enabled</span><div className="w-9 h-5 rounded-full bg-violet-600 relative"><div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" /></div></div>
            <div><label className="text-xs text-zinc-500 mb-1.5 block">Provider</label><select className={inputClass} style={inputStyle}><option>Perplexity Sonar</option><option>Google Search</option></select></div>
          </div>
        );

      case 'tool-llm':
        return modalData ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Model</label>
              <select className={inputClass} style={inputStyle}
                      value={modalData.model}
                      onChange={e => setModalData((p: any) => ({ ...p, model: e.target.value }))}>
                <option value="claude-sonnet-4-6">Claude Sonnet 4</option>
                <option value="claude-opus-4-6">Claude Opus 4</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </div>
            <div><label className="text-xs text-zinc-500 mb-1.5 block">Temperature</label><input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full accent-violet-500" /></div>
            <div><label className="text-xs text-zinc-500 mb-1.5 block">Max Tokens</label><input type="number" defaultValue={4096} className={inputClass} style={inputStyle} /></div>
          </div>
        ) : null;

      case 'tool-memory':
        return modalData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Persistent Memory</span>
              <span className="text-xs text-zinc-500">{modalData.memories.length} entries</span>
            </div>
            {modalData.memories.length === 0 ? (
              <p className="text-xs text-zinc-500">No memories stored yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {modalData.memories.map((m: any, i: number) => (
                  <div key={m.id || i} className="px-3 py-2 rounded-lg" style={inputStyle}>
                    <div className="flex items-center gap-2 mb-1">
                      {m.type && <span className="px-1.5 py-0.5 rounded text-[10px] text-violet-300" style={{ background: 'rgba(124,58,237,0.15)' }}>{m.type}</span>}
                      <span className="text-[10px] text-zinc-600">{m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{m.content || m.text || JSON.stringify(m)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null;

      case 'task-scheduled':
        return modalData ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">Recurring tasks on a schedule.</p>
            {modalData.cronJobs.length === 0 ? (
              <div className="px-3 py-4 rounded-lg text-center text-sm text-zinc-500" style={inputStyle}>No scheduled tasks</div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {modalData.cronJobs.map((job: any) => (
                  <div key={job.id} className="px-3 py-2 rounded-lg flex items-center justify-between" style={inputStyle}>
                    <div>
                      <span className="text-sm text-zinc-300">{job.name}</span>
                      <span className="text-xs text-zinc-500 ml-2">{job.cron_expression}</span>
                    </div>
                    <button onClick={() => deleteCron(job.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <input className={inputClass} style={inputStyle} placeholder="Task name" value={newCronName} onChange={e => setNewCronName(e.target.value)} />
              <input className={inputClass} style={inputStyle} placeholder="Cron expression (e.g. 0 7 * * *)" value={newCronExpr} onChange={e => setNewCronExpr(e.target.value)} />
              <textarea className={`${inputClass} h-16 resize-none`} style={inputStyle} placeholder="Prompt" value={newCronPrompt} onChange={e => setNewCronPrompt(e.target.value)} />
              <button onClick={createCron} disabled={!newCronName || !newCronExpr || !newCronPrompt}
                      className="w-full px-4 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
                      style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                + Add Schedule
              </button>
            </div>
          </div>
        ) : null;

      case 'com-messaging':
        return modalData ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Telegram Chat ID</label>
              <input className={inputClass} style={inputStyle} placeholder="207851519"
                     value={modalData.chatId}
                     onChange={e => setModalData((p: any) => ({ ...p, chatId: e.target.value }))} />
            </div>
            <button onClick={testTelegram} className="px-4 py-2 rounded-lg text-sm text-violet-400 hover:text-violet-300" style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
              Send Test Message
            </button>
          </div>
        ) : null;

      // --- Static / Coming Soon modals ---
      case 'com-chat':
        return (<div className="space-y-3"><p className="text-sm text-zinc-400">Direct chat with your agent.</p><div className="flex items-center justify-between"><span className="text-xs text-zinc-500">Status</span><span className="text-xs text-emerald-400">Connected</span></div></div>);
      case 'task-projects':
        return (<div className="space-y-3"><p className="text-sm text-zinc-400">Active projects and objectives.</p><span className="inline-block px-2 py-0.5 rounded text-[10px] text-zinc-500" style={{ ...inputStyle }}>Coming soon</span></div>);
      case 'task-research':
        return (<div className="space-y-3"><p className="text-sm text-zinc-400">Research tasks and findings.</p><span className="inline-block px-2 py-0.5 rounded text-[10px] text-zinc-500" style={{ ...inputStyle }}>Coming soon</span></div>);
      case 'com-email':
        return (<div className="space-y-3"><p className="text-sm text-zinc-400">Email notifications.</p><span className="inline-block px-2 py-0.5 rounded text-[10px] text-zinc-500" style={{ ...inputStyle }}>Coming soon</span></div>);
      case 'com-apis':
        return (<div className="space-y-3"><p className="text-sm text-zinc-400">External API integrations.</p><span className="inline-block px-2 py-0.5 rounded text-[10px] text-zinc-500" style={{ ...inputStyle }}>Coming soon</span></div>);
      default:
        return null;
    }
  }

  if (!agentId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
          <Users size={28} className="text-violet-400" />
        </div>
        <h2 className="text-xl font-light text-zinc-200 mb-2">Select or Create a Team</h2>
        <p className="text-sm text-zinc-500 max-w-sm mb-6">Assemble a team of AI specialists that research, trade, and plan — 24/7.</p>
        <Link href="/teams" className="px-6 py-2.5 rounded-xl text-sm font-medium text-white border border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20 transition-all">
          Choose Your Squad
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin' />
      </div>
    );
  }

  return (
    <div className='h-full w-full relative' style={{ background: '#09090b' }}>
      {/* Header overlay */}
      <div className='absolute top-4 left-4 z-10 flex items-center gap-2'>
        <button
          onClick={() => router.push(`/dashboard/agents/${agentId}`)}
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-200 backdrop-blur'
          style={{ background: 'rgba(9,9,11,0.8)' }}
        >
          <LayoutList size={13} /> Dashboard
        </button>
        {agentName && (
          <span className='text-xs text-zinc-600 ml-1'>{agentName}</span>
        )}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{ animated: false }}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(event, node) => {
          if (node.type === 'agent' && node.data.agentId) {
            router.push(`/dashboard/agents/${node.data.agentId}`);
            return;
          }
          if (node.data.isToggle) {
            setLeftExpanded(prev => !prev);
            return;
          }
          if (node.type === 'tool' || node.type === 'output' || node.type === 'trigger') {
            setOpenModal(node.id);
          }
        }}
      >
        <Background color='rgba(255,255,255,0.02)' gap={24} />
        <Controls style={{ background: 'transparent' }} />
        <Panel position='bottom-center'>
          <div className='w-full max-w-2xl' style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px 12px 0 0' }}>
            <div className='flex items-center justify-between px-4 py-2.5'>
              <span className='text-[11px] text-zinc-500 font-medium uppercase tracking-wider'>Tools & Skills</span>
              <button onClick={() => setPaletteOpen(!paletteOpen)} className='text-zinc-500 hover:text-zinc-300 transition-colors'>
                {paletteOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>
            {paletteOpen && (
              <div className='flex gap-2 px-4 pb-3 overflow-x-auto'>
                {[
                  { icon: Search, label: 'Web Search', color: 'text-violet-400' },
                  { icon: Shield, label: 'Wallet', color: 'text-violet-400' },
                  { icon: Brain, label: 'Memory', color: 'text-violet-400' },
                  { icon: Clock, label: 'Cron Schedule', color: 'text-amber-400' },
                  { icon: Send, label: 'Telegram', color: 'text-violet-400' },
                  { icon: Zap, label: 'MCP Server', color: 'text-amber-400' },
                  { icon: Plus, label: 'Add Skill', color: 'text-zinc-500' },
                ].map(t => (
                  <div key={t.label} className='flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-zinc-400 whitespace-nowrap cursor-default hover:bg-white/[0.03] transition-colors' style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <t.icon size={12} className={t.color} /> {t.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>

      {/* Settings Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
          <div className="w-full max-w-lg mx-4 rounded-2xl p-6 shadow-2xl"
               style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.06)' }}
               onClick={e => e.stopPropagation()}>
            {renderModalContent(openModal)}
          </div>
        </div>
      )}
    </div>
  );
}
