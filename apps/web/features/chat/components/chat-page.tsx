"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/shared/api/client";
import { useWebSocket } from "../hooks/use-websocket";
import type { ChatMessage } from "@/shared/types";

interface Props {
  agentId: string;
  sessionId: string;
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WS_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
    /^http/,
    "ws"
  ) + "/ws";

export function ChatPage({ agentId, sessionId }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const onWsMessage = useCallback(
    (data: unknown) => {
      const msg = data as {
        event: string;
        data: { session_id: string; message_id: string; delta?: string; content?: string };
      };
      if (!msg?.event || msg.data?.session_id !== sessionId) return;

      switch (msg.event) {
        case "chat:message_start":
          setStreamingMsgId(msg.data.message_id);
          setStreamingContent("");
          break;
        case "chat:message_delta":
          setStreamingContent((prev) => prev + (msg.data.delta || ""));
          break;
        case "chat:message_end":
          setMessages((prev) => [
            ...prev,
            {
              id: msg.data.message_id,
              role: "assistant",
              content: msg.data.content || "",
            },
          ]);
          setStreamingMsgId(null);
          setStreamingContent("");
          break;
      }
    },
    [sessionId]
  );

  useWebSocket({
    url: WS_URL,
    token,
    onMessage: onWsMessage,
  });

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
            }))
        )
      )
      .catch(() => {});
  }, [agentId, sessionId, token, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const userMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      await api.post(
        `/api/agents/${agentId}/sessions/${sessionId}/messages`,
        { content }
      );
    } catch {
      // error — the streaming should still work via WS
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/agents/${agentId}`)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
        <h1 className="text-sm font-medium text-muted-foreground">
          Session {sessionId.slice(0, 8)}
        </h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingMsgId && (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Start a conversation</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {streamingMsgId && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl px-4 py-2 text-sm bg-card border border-border whitespace-pre-wrap">
              {streamingContent || (
                <span className="animate-pulse text-muted-foreground">
                  Thinking...
                </span>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
