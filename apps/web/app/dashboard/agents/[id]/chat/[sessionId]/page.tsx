"use client";

import { useParams } from "next/navigation";
import { ChatPage } from "@/features/chat/components/chat-page";

export default function ChatRoute() {
  const params = useParams();
  return (
    <ChatPage
      agentId={params.id as string}
      sessionId={params.sessionId as string}
    />
  );
}
