'use client';
import React, { useEffect, useState } from 'react';
import { ReactFlow, Panel, Controls, Background, Handle, Position, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './canvas.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/shared/api/client';
import { Search, BarChart3, Globe, FileText, Brain, Clock, Send, MessageSquare, Bell, Zap, Wallet, LayoutList, Shield, Plus, ChevronDown, ChevronUp, Scroll, Cpu, FolderKanban, BookOpen, Mail } from 'lucide-react';
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
  const router = useRouter();
  const statusColor = data.status === 'working' ? 'bg-blue-400 animate-pulse' : data.status === 'idle' ? 'bg-emerald-400' : 'bg-zinc-600';
  return (
    <div
      onClick={() => data.agentId && router.push(`/dashboard/agents/${data.agentId}`)}
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
  default: Globe,
};

function ToolNode({ data }: { data: any }) {
  const Icon = TOOL_ICONS[data.toolId] || TOOL_ICONS.default;
  return (
    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', minWidth: 130 }}>
      <Handle type='target' position={Position.Top} style={{ background: '#a78bfa', border: 'none', width: 6, height: 6 }} />
      <div className='flex items-center gap-2'>
        <div className='w-7 h-7 rounded flex items-center justify-center' style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <Icon size={14} className='text-violet-400' />
        </div>
        <div className='text-xs text-zinc-400'>{data.name}</div>
      </div>
    </div>
  );
}

function TriggerNode({ data }: { data: any }) {
  return (
    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', minWidth: 140 }}>
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
    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', minWidth: 120 }}>
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

  useEffect(() => {
    if (!agentId) return;

    async function load() {
      try {
        const agent = await api.get<any>(`/api/agents/${agentId}`);
        setAgentName(agent.name || '');
        let team: any[] = [];
        try { team = await api.get<any[]>(`/api/agents/${agentId}/team`); } catch {}

        const n: Node[] = [];
        const e: Edge[] = [];

        // --- Category Headers ---
        n.push({ id: 'cat-tools', type: 'category', position: { x: 60, y: 15 }, data: { label: 'Tools & Settings' }, draggable: false, selectable: false });
        n.push({ id: 'cat-tasks', type: 'category', position: { x: 740, y: 15 }, data: { label: 'Tasks & Objectives' }, draggable: false, selectable: false });
        n.push({ id: 'cat-coms', type: 'category', position: { x: 380, y: 440 }, data: { label: 'Coms & Resources' }, draggable: false, selectable: false });

        // --- LEFT: Tools & Settings ---
        const leftTools = [
          { id: 'tool-soul', name: 'Soul / Mission', toolId: 'soul' },
          { id: 'tool-documents', name: 'Documents', toolId: 'documents' },
          { id: 'tool-llm', name: 'LLM Selection', toolId: 'llm' },
          { id: 'tool-web-search', name: 'Web Search', toolId: 'web_search' },
          { id: 'tool-wallet', name: 'Wallet', toolId: 'wallet_propose' },
          { id: 'tool-memory', name: 'Memory', toolId: 'memory_read' },
        ];
        leftTools.forEach((t, i) => {
          n.push({ id: t.id, type: 'tool', position: { x: 60, y: 50 + i * 62 }, data: { name: t.name, toolId: t.toolId } });
          e.push({ id: `e-${t.id}-lead`, source: t.id, target: agent.id, type: 'default',
            style: { stroke: 'rgba(124,58,237,0.15)', strokeWidth: 1, strokeDasharray: '4' } });
        });

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
          { id: 'task-scheduled', name: 'Scheduled Tasks', toolId: 'cron' },
          { id: 'task-projects', name: 'Projects', toolId: 'projects' },
          { id: 'task-research', name: 'Research', toolId: 'research' },
        ];
        rightTasks.forEach((t, i) => {
          n.push({ id: t.id, type: 'tool', position: { x: 740, y: 50 + i * 62 }, data: { name: t.name, toolId: t.toolId } });
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
    }
    load();
  }, [agentId]);

  if (!agentId) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-zinc-600 text-sm'>Select an agent from the sidebar to view their canvas.</p>
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
    </div>
  );
}
