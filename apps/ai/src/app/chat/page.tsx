import { ChatThread } from "@/components/chat/ChatThread";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Chat · INDEX0 AI",
  description: "Talk to INDEX0 — research-first AI software engineering",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full">
          <ChatThread />
        </div>
      </div>
    </div>
  );
}
