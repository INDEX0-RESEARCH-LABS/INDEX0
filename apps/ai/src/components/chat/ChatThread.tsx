"use client";

import { useChat, type Message } from "ai/react";
import { useRef, useEffect, useState } from "react";
import { SourceBadge } from "./SourceBadge";
import { GroundworkTrigger } from "./GroundworkTrigger";

export function ChatThread() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } =
    useChat({ api: "/api/chat" });

  const bottomRef = useRef<HTMLDivElement>(null);
  const [showGroundwork, setShowGroundwork] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user")?.content;

  useEffect(() => {
    if (lastUserMessage) {
      const lower = lastUserMessage.toLowerCase();
      const triggers = ["build", "app", "platform", "system", "product", "saas", "startup"];
      setShowGroundwork(triggers.some((t) => lower.includes(t)));
    }
  }, [lastUserMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <span className="text-[var(--accent-fg)] font-mono text-lg font-bold">I0</span>
            </div>
            <div>
              <h2 className="text-xl font-mono font-semibold text-[var(--fg)] mb-2">
                INDEX0 AI
              </h2>
              <p className="text-[var(--muted)] text-sm max-w-sm">
                Describe the app you want to build. I&apos;ll research the real
                market before writing a single line of code.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {[
                "Build me a ride-hailing app for Lagos, Nigeria",
                "Build a B2B SaaS for restaurant inventory management",
                "Create a telemedicine platform for Southeast Asia",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => append({ role: "user", content: prompt })}
                  className="text-left px-4 py-3 rounded-lg border border-[var(--border-oklab)] text-[var(--muted)] text-sm hover:border-[var(--border-oklab-strong)] hover:text-[var(--fg)] transition-all font-mono"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg: Message) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-mono font-bold ${
                msg.role === "user"
                  ? "bg-[var(--surface-200)] text-[var(--fg)]"
                  : "bg-[var(--accent)] text-[var(--accent-fg)]"
              }`}
            >
              {msg.role === "user" ? "U" : "I0"}
            </div>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm font-mono leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[var(--surface-100)] text-[var(--fg)]"
                  : "bg-[var(--surface-warm)] text-[var(--fg)]"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" &&
                msg.content.includes("source") && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    <SourceBadge label="verified source" />
                  </div>
                )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs font-mono font-bold text-[var(--accent-fg)]">
              I0
            </div>
            <div className="bg-[var(--surface-warm)] rounded-xl px-4 py-3">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* GROUNDWORK suggestion */}
      {showGroundwork && messages.length > 0 && (
        <GroundworkTrigger
          prompt={lastUserMessage || ""}
          onDismiss={() => setShowGroundwork(false)}
        />
      )}

      {/* Input */}
      <div className="border-t border-[var(--border-oklab)] px-4 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Describe the app you want to build..."
            className="flex-1 bg-[var(--surface-100)] border border-[var(--border-oklab)] rounded-lg px-4 py-2.5 text-sm font-mono text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--border-oklab-strong)] transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-fg)] rounded-lg text-sm font-mono font-medium hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
