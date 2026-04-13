'use client';
import React, { useEffect, useState } from 'react';
import { ReactFlow, MiniMap, Controls, Background, Handle, Position, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './canvas.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/shared/api/client';
import { Search, BarChart3, Globe, FileText, Brain, Clock, Send, MessageSquare, Bell, Zap, Wallet, LayoutList } from 'lucide-react';
import type { Agent } from '@/shared/types';
import dagre from 'dagre';

// --- Custom Node Components ---

function AgentNode({ data }: { data: any }) {
  const statusColor = data.status === 'working' ? 'bg-blue-400 animate-pulse' : data.status === 'idle' ? 'bg-emerald-400' : 'bg-zinc-600';
  return (
    <div className='px-4 py-3 rounded-xl backdrop-blur min-w-[180px]' style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
  'web_search': Search, 'web-search': Search, 'price-check': BarChart3, 'price_check': BarChart3,
  'wallet_propose': Wallet, 'document-analyzer': FileText, 'document_search': FileText,
  'memory_read': Brain, 'memory_write': Brain, 'portfolio-tracker': BarChart3, 'morning-brief': Zap,
  default: Globe,
};

function ToolNode({ data }: { data: any }) {
  const Icon = TOOL_ICONS[data.toolId] || TOOL_ICONS.default;
  return (
    <div className='px-3 py-2 rounded-lg min-w-[130px]' style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
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
    <div className='px-3 py-2.5 rounded-lg min-w-[150px]' style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
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

function OutputNode({ data }: { data: any }) {
  const Icon = data.channel === 'telegram' ? Send : data.channel === 'email' ? Bell : MessageSquare;
  return (
    <div className='px-3 py-2.5 rounded-lg min-w-[130px]' style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
      <Handle type='target' position={Position.Left} style={{ background: '#10b981', border: 'none', width: 6, height: 6 }} />
      <div className='flex items-center gap-2'>
        <Icon size={14} className='text-emerald-400' />
        <div className='text-xs text-zinc-400'>{data.name}</div>
      </div>
    </div>
  );
}

const nodeTypes = { agent: AgentNode, tool: ToolNode, trigger: TriggerNode, output: OutputNode };

// --- Layout ---
function layoutWithDagre(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 120, marginx: 40, marginy: 40 });
  nodes.forEach(n => g.setNode(n.id, { width: 200, height: 60 }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map(n => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - 100, y: pos.y - 30 } };
  });
}

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
        let skills: any[] = [];
        try { skills = await api.get<any[]>(`/api/agents/${agentId}/skills`); } catch {}
        let cronJobs: any[] = [];
        try { cronJobs = await api.get<any[]>(`/api/agents/${agentId}/cron-jobs`); } catch {}

        const n: Node[] = [];
        const e: Edge[] = [];

        // Lead agent
        n.push({ id: agent.id, type: 'agent', data: { name: agent.name, role: 'Lead', avatarUrl: getAvatarUrl(agent), accentColor: '#7c3aed', status: agent.status || 'idle' }, position: { x: 0, y: 0 } });

        // Specialists
        team.forEach((sub: any) => {
          n.push({ id: sub.id, type: 'agent', data: { name: sub.name, role: sub.description || 'Specialist', avatarUrl: getAvatarUrl(sub), accentColor: '#a78bfa', status: sub.status || 'idle' }, position: { x: 0, y: 0 } });
          e.push({ id: `e-${agent.id}-${sub.id}`, source: agent.id, target: sub.id, animated: true, style: { stroke: 'rgba(124,58,237,0.3)', strokeWidth: 2 } });
        });

        // Skills as tool nodes
        const toolTargets = team.length > 0 ? team.map((s: any) => s.id) : [agent.id];
        skills.forEach((skill: any, i: number) => {
          const toolId = `tool-${skill.skill_id || skill.id}`;
          const parentId = toolTargets[i % toolTargets.length];
          n.push({ id: toolId, type: 'tool', data: { name: skill.name, toolId: skill.name?.replace(/\s+/g, '-').toLowerCase() }, position: { x: 0, y: 0 } });
          e.push({ id: `e-${parentId}-${toolId}`, source: parentId, target: toolId, style: { stroke: 'rgba(167,139,250,0.2)', strokeWidth: 1.5, strokeDasharray: '4' } });
        });

        // Built-in tools
        const builtins = [
          { id: 'builtin-web-search', name: 'Web Search', toolId: 'web_search' },
          { id: 'builtin-wallet', name: 'Wallet', toolId: 'wallet_propose' },
          { id: 'builtin-memory', name: 'Memory', toolId: 'memory_read' },
        ];
        builtins.forEach(t => {
          n.push({ id: t.id, type: 'tool', data: { name: t.name, toolId: t.toolId }, position: { x: 0, y: 0 } });
          e.push({ id: `e-${agent.id}-${t.id}`, source: agent.id, target: t.id, style: { stroke: 'rgba(167,139,250,0.15)', strokeWidth: 1.5, strokeDasharray: '4' } });
        });

        // Cron jobs as triggers
        cronJobs.forEach((cj: any) => {
          const tid = `trigger-${cj.id}`;
          n.push({ id: tid, type: 'trigger', data: { name: cj.name, schedule: cj.cron_expression }, position: { x: 0, y: 0 } });
          e.push({ id: `e-${tid}-${agent.id}`, source: tid, target: agent.id, style: { stroke: 'rgba(245,158,11,0.3)', strokeWidth: 1.5 } });
        });

        // Output nodes
        n.push({ id: 'output-chat', type: 'output', data: { name: 'Chat', channel: 'chat' }, position: { x: 0, y: 0 } });
        e.push({ id: 'e-lead-chat', source: agent.id, target: 'output-chat', style: { stroke: 'rgba(16,185,129,0.3)', strokeWidth: 1.5 } });
        n.push({ id: 'output-telegram', type: 'output', data: { name: 'Telegram', channel: 'telegram' }, position: { x: 0, y: 0 } });
        e.push({ id: 'e-lead-telegram', source: agent.id, target: 'output-telegram', style: { stroke: 'rgba(16,185,129,0.3)', strokeWidth: 1.5 } });

        // Auto-layout
        const laid = layoutWithDagre(n, e);
        setNodes(laid);
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
        <MiniMap
          nodeColor={(n) => n.type === 'agent' ? '#7c3aed' : n.type === 'trigger' ? '#f59e0b' : n.type === 'output' ? '#10b981' : '#71717a'}
          maskColor='rgba(0,0,0,0.85)'
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}
        />
        <Controls style={{ background: 'transparent' }} />
      </ReactFlow>
    </div>
  );
}
