"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowUp, RotateCcw, RefreshCw, Search, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/shared/api/client";
import type { ChatMessage } from "@/shared/types";
import { AgentAvatar } from "@/shared/components/agent-avatar";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Props {
  agentId: string;
  sessionId: string;
  agentName?: string;
  agentModel?: string;
  agentEmoji?: string;
}

interface WalletEventData {
  type: 'propose' | 'policy' | 'executed' | 'blocked';
  action?: string;
  input_token?: string;
  output_token?: string;
  amount?: string;
  output_amount?: string;
  approved?: boolean;
  checks?: Array<{rule: string; passed: boolean; details: string}>;
  tx_signature?: string;
  reason?: string;
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  walletCard?: WalletEventData | null;
}

function WalletCard({ event }: { event: {
  type: 'propose' | 'policy' | 'executed' | 'blocked';
  action?: string;
  input_token?: string;
  output_token?: string;
  amount?: string;
  output_amount?: string;
  approved?: boolean;
  checks?: Array<{rule: string; passed: boolean; details: string}>;
  tx_signature?: string;
  reason?: string;
} | null }) {
  if (!event) return null;

  const borderColor = event.type === 'executed' ? 'border-green-500/30' :
                      event.type === 'blocked' ? 'border-red-500/30' : 'border-border';

  return (
    <div className={`rounded-lg border ${borderColor} bg-card/50 p-3 mb-2 text-xs space-y-2`}>
      {/* Proposal */}
      <div className="flex items-center gap-2">
        <RefreshCw className="w-3 h-3 text-violet-400" />
        <span className="font-medium">
          Swap {event.amount} {event.input_token} → {event.output_amount || '...'} {event.output_token}
        </span>
      </div>

      {/* Policy */}
      {(event.type === 'policy' || event.type === 'executed' || event.type === 'blocked') && (
        <div className={`flex items-center gap-1 ${event.approved ? 'text-green-400' : 'text-red-400'}`}>
          {event.approved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          <span>Policy: {event.approved ? 'Approved' : 'Blocked'}</span>
        </div>
      )}

      {/* Policy checks */}
      {event.checks && (
        <div className="pl-5 space-y-0.5 text-muted-foreground">
          {event.checks.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <span>{c.passed ? '✓' : '✗'}</span>
              <span>{c.rule}: {c.details}</span>
            </div>
          ))}
        </div>
      )}

      {/* Executed */}
      {event.type === 'executed' && event.tx_signature && (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle2 className="w-3 h-3" /><span>Executed</span>
          <a href={`https://solscan.io/tx/${event.tx_signature}`} target="_blank"
             rel="noopener noreferrer"
             className="underline hover:text-green-300">
            {event.tx_signature.slice(0, 8)}...{event.tx_signature.slice(-4)} ↗
          </a>
        </div>
      )}

      {/* Blocked */}
      {event.type === 'blocked' && (
        <div className="text-red-400">
          <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> {event.reason || 'Transaction blocked'}</span>
        </div>
      )}

      {/* Loading indicator for propose state */}
      {event.type === 'propose' && (
        <div className="text-muted-foreground animate-pulse">
          Evaluating policy...
        </div>
      )}
    </div>
  );
}

export function ChatPage({ agentId, sessionId, agentName, agentModel, agentEmoji }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolStatus, setToolStatus] = useState<{tool: string; query: string; done: boolean} | null>(null);
  const [walletEvent, setWalletEvent] = useState<WalletEventData | null>(null);
  const walletEventRef = useRef<WalletEventData | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    api
      .get<ChatMessage[]>(
        `/api/agents/${agentId}/sessions/${sessionId}/messages`
      )
      .then((msgs) =>
        setMessages(
          msgs
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              timestamp: m.created_at,
            }))
        )
      )
      .catch(() => {});
  }, [agentId, sessionId, token, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, []);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const userMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setSending(true);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const res = await fetch(
        `${BASE_URL}/api/agents/${agentId}/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let assistantMsgId = "";

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const evt = JSON.parse(line.slice(6));
              if (evt.type === "message_start") {
                assistantMsgId = evt.message_id || crypto.randomUUID();
              } else if (evt.type === "tool_use_start") {
                setToolStatus({ tool: evt.tool, query: evt.query || "", done: false });
              } else if (evt.type === "tool_use_end") {
                setToolStatus({ tool: evt.tool, query: evt.query || "", done: true });
              } else if (evt.type === "wallet_propose") {
                const we: WalletEventData = {
                  type: 'propose',
                  action: evt.action,
                  input_token: evt.input_token,
                  output_token: evt.output_token,
                  amount: evt.amount,
                  output_amount: evt.output_amount,
                };
                walletEventRef.current = we;
                setWalletEvent(we);
              } else if (evt.type === "wallet_policy") {
                const we = walletEventRef.current ? {
                  ...walletEventRef.current,
                  type: 'policy' as const,
                  approved: evt.approved,
                  checks: evt.checks,
                } : null;
                walletEventRef.current = we;
                setWalletEvent(we);
              } else if (evt.type === "wallet_executed") {
                const we = walletEventRef.current ? {
                  ...walletEventRef.current,
                  type: 'executed' as const,
                  tx_signature: evt.tx_signature,
                } : null;
                walletEventRef.current = we;
                setWalletEvent(we);
              } else if (evt.type === "wallet_blocked") {
                const we = walletEventRef.current ? {
                  ...walletEventRef.current,
                  type: 'blocked' as const,
                  reason: evt.reason,
                } : null;
                walletEventRef.current = we;
                setWalletEvent(we);
              } else if (evt.type === "content_delta" && evt.delta) {
                setToolStatus(null); // Clear tool status when content starts
                accumulated += evt.delta;
                setStreamingContent(accumulated);
              } else if (evt.type === "message_end") {
                // Capture wallet event before clearing
                const savedWalletEvent = walletEventRef.current;
                setWalletEvent(null);
                setToolStatus(null);
                walletEventRef.current = null;
                setMessages((prev) => [
                  ...prev,
                  {
                    id: assistantMsgId,
                    role: "assistant",
                    content: accumulated,
                    timestamp: new Date().toISOString(),
                    walletCard: savedWalletEvent,
                  },
                ]);
                setStreamingContent("");
                setIsStreaming(false);
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }

      if (accumulated && isStreaming) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: accumulated,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      try {
        const msg = await api.post<ChatMessage>(
          `/api/agents/${agentId}/sessions/${sessionId}/messages`,
          { content }
        );
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            role: "assistant",
            content: msg.content,
            timestamp: msg.created_at,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Failed to get response. Please try again.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setSending(false);
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleNewSession = async () => {
    try {
      const session = await api.post<{ id: string }>(
        `/api/agents/${agentId}/sessions`
      );
      router.push(`/dashboard/agents/${agentId}/chat/${session.id}`);
    } catch {
      // ignore
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/agents/${agentId}`)}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            &larr;
          </button>
          <AgentAvatar emoji={agentEmoji} size={28} />
          <div>
            <h1 className="text-sm font-semibold">
              {agentName || "Agent"}
            </h1>
          </div>
          {agentModel && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {agentModel}
            </span>
          )}
        </div>
        <button
          onClick={handleNewSession}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          New Session
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3">&#x1F44B;</div>
            <h2 className="text-lg font-semibold mb-1">
              Start a conversation...
            </h2>
            <p className="text-sm text-muted-foreground">
              {agentName
                ? `Chat with ${agentName}`
                : "Send a message to get started"}
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%] sm:max-w-[75%]">
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                {msg.walletCard && <WalletCard event={msg.walletCard} />}
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:bg-background [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 px-1">
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] sm:max-w-[75%]">
              <div className="rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-card border border-border">
                {walletEvent && <WalletCard event={walletEvent} />}
                {toolStatus && (
                  <div className={`flex items-center gap-2 text-xs mb-2 px-2 py-1.5 rounded-lg ${toolStatus.done ? 'bg-green-500/5 text-green-400' : 'bg-primary/5 text-muted-foreground'}`}>
                    {toolStatus.done ? <span>✓</span> : <Search className="w-3 h-3" />}
                    <span className={!toolStatus.done ? 'animate-pulse' : ''}>
                      {toolStatus.done ? 'Searched' : 'Searching'}: "{toolStatus.query}"
                    </span>
                  </div>
                )}
                {streamingContent ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:bg-background [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-primary/70 animate-pulse ml-0.5 align-text-bottom" />
                  </div>
                ) : !toolStatus ? (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <span className="inline-block w-2 h-4 bg-primary/70 animate-pulse" />
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 sm:p-4 shrink-0">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message your team lead..."
            disabled={sending}
            rows={1}
            className="w-full rounded-xl border border-input bg-background pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="absolute right-2 bottom-2 rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
