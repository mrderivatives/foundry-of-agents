"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/shared/api/client";
import type { ChatMessage } from "@/shared/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Props {
  agentId: string;
  sessionId: string;
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatPage({ agentId, sessionId }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    setIsStreaming(true);
    setStreamingContent("");

    try {
      // Use SSE streaming
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
          // Keep the last potentially incomplete line in buffer
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
                // Stream complete — add final message
                setMessages((prev) => [
                  ...prev,
                  {
                    id: assistantMsgId,
                    role: "assistant",
                    content: accumulated,
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

      // If stream ended without message_end (fallback)
      if (accumulated && isStreaming) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: accumulated },
        ]);
      }
    } catch {
      // On error, try non-streaming fallback
      try {
        const msg = await api.post<ChatMessage>(
          `/api/agents/${agentId}/sessions/${sessionId}/messages`,
          { content }
        );
        setMessages((prev) => [
          ...prev,
          { id: msg.id, role: "assistant", content: msg.content },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: "⚠️ Failed to get response" },
        ]);
      }
    } finally {
      setSending(false);
      setIsStreaming(false);
      setStreamingContent("");
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
        {messages.length === 0 && !isStreaming && (
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
        {isStreaming && (
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
