"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowUp, RotateCcw } from "lucide-react";
import { api } from "@/shared/api/client";
import type { ChatMessage } from "@/shared/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Props {
  agentId: string;
  sessionId: string;
  agentName?: string;
  agentModel?: string;
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function ChatPage({ agentId, sessionId, agentName, agentModel }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
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
              } else if (evt.type === "content_delta" && evt.delta) {
                accumulated += evt.delta;
                setStreamingContent(accumulated);
              } else if (evt.type === "message_end") {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: assistantMsgId,
                    role: "assistant",
                    content: accumulated,
                    timestamp: new Date().toISOString(),
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
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
                {streamingContent ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:bg-background [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-primary/70 animate-pulse ml-0.5 align-text-bottom" />
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <span className="inline-block w-2 h-4 bg-primary/70 animate-pulse" />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
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
            placeholder="Send a message..."
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
