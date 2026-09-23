"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/ui/nav";

type SourceRef = {
  table: string;
  name: string;
  sourceName: string | null;
  sourceUrl: string | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  sources?: SourceRef[];
  grounded?: boolean;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message ?? "Failed to get a response.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer ?? "I couldn't generate an answer.",
          sources: data.sources ?? [],
          grounded: data.grounded ?? false,
        },
      ]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nature-page">
      <Nav />
      <section
        className="nature-hero"
        style={{
          minHeight: 320,
          backgroundImage:
            'linear-gradient(to top, rgba(10,35,25,0.82), rgba(10,35,25,0.12)), url("/images/hero.jpeg")',
        }}
      >
        <div className="nature-hero-content">
          <span>AI ASSISTANT</span>
          <h1>Ask about Manipur</h1>
          <p>
            Ask about destinations, food, experiences and travel. Answers are
            grounded in our verified tourism data.
          </p>
        </div>
      </section>

      <main
        className="nature-content"
        style={{ maxWidth: 780, paddingBottom: 60 }}
      >
        <Link href="/" className="back-link">
          &larr; Back to Home
        </Link>

        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            border: "1px solid rgba(23,63,43,.07)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "60vh",
            minHeight: 400,
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: "center", marginTop: 60 }}>
                <p
                  style={{
                    color: "#66756c",
                    fontSize: 15,
                    marginBottom: 16,
                  }}
                >
                  Ask me anything about Manipur — destinations, food, culture,
                  travel tips, or your itinerary.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  {[
                    "What are the best nature destinations?",
                    "Tell me about Loktak Lake",
                    "What food should I try in Manipur?",
                    "How do I plan a 3-day trip?",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setInput(q)}
                      style={{
                        background: "#edf5ef",
                        color: "#466553",
                        border: "none",
                        borderRadius: 999,
                        padding: "8px 14px",
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    background:
                      msg.role === "user" ? "#173f2b" : "#f8faf8",
                    color:
                      msg.role === "user" ? "#fff" : "#173f2b",
                    borderRadius: 16,
                    padding: "12px 16px",
                    fontSize: 14,
                    lineHeight: 1.7,
                    border:
                      msg.role === "assistant"
                        ? "1px solid rgba(23,63,43,.06)"
                        : "none",
                  }}
                >
                  {msg.text}
                </div>
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {msg.sources.slice(0, 5).map((s, j) => (
                      <span
                        key={j}
                        style={{
                          fontSize: 10,
                          color: "#5d8c72",
                          background: "#edf5ef",
                          padding: "3px 8px",
                          borderRadius: 999,
                        }}
                      >
                        {s.sourceUrl ? (
                          <a
                            href={s.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#28704e", textDecoration: "underline" }}
                          >
                            {s.name} ({s.table})
                          </a>
                        ) : (
                          `${s.name} (${s.table})`
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {msg.role === "assistant" && msg.grounded === false && (
                  <p style={{ marginTop: 4, fontSize: 10, color: "#b45309" }}>
                    This answer could not be fully verified against our tourism database.
                  </p>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: "flex-start" }}>
                <div
                  style={{
                    background: "#f8faf8",
                    borderRadius: 16,
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "#66756c",
                    border: "1px solid rgba(23,63,43,.06)",
                  }}
                >
                  Thinking...
                </div>
              </div>
            )}

            {error && (
              <div style={{ alignSelf: "center" }}>
                <p style={{ color: "#b45309", fontSize: 13 }}>{error}</p>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              gap: 10,
              padding: "16px 20px",
              borderTop: "1px solid rgba(23,63,43,.06)",
              background: "#fff",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Manipur..."
              disabled={loading}
              style={{
                flex: 1,
                borderRadius: 999,
                border: "1px solid #dce5dd",
                background: "#faf9f6",
                padding: "10px 18px",
                fontSize: 14,
                color: "#173f2b",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: loading ? "#66756c" : "#28704e",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "10px 22px",
                fontSize: 13,
                fontWeight: 600,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-mark">M</span>
              Explore Manipur
            </div>
            <p>Discover. Experience. Remember.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Explore</h4>
              <Link href="/#destinations">Destinations</Link>
              <Link href="/#experiences">Experiences</Link>
              <Link href="/#map">Map</Link>
            </div>
            <div>
              <h4>Plan</h4>
              <Link href="/plan-trip">Plan a Trip</Link>
              <Link href="/travel-stay">Travel & Stay</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Explore Manipur</span>
        </div>
      </footer>
    </div>
  );
}
