"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

const STORAGE_KEY = "dhc-chat-v1";
const WELCOME: Msg = {
  role: "assistant",
  content:
    "Assalam o Alaikum! I'm the **DHA Property Assistant**. Ask me about plots, houses or commercial property for sale or rent in any DHA Lahore phase.",
};
const SUGGESTIONS = [
  "Cheapest 10 marla plot in Phase 8",
  "1 kanal houses for rent in Phase 6",
  "Commercial property in Broadway",
  "Plots under 3 crore in Phase 9 Prism",
];

function load(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Msg[]) : null;
    return saved?.length ? saved : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

function save(msgs: Msg[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-30)));
  } catch {
    /* storage unavailable — chat still works */
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setMsgs(load()), []);
  useEffect(() => save(msgs.filter((m) => !m.error)), [msgs]);

  useEffect(() => {
    if (loading) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [loading]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;

    const history = msgs
      .filter((m) => !m.error && m.content !== WELCOME.content)
      .map(({ role, content }) => ({ role, content }));
    setMsgs((m) => [...m.filter((x) => !x.error), { role: "user", content: message }]);
    setInput("");
    setLoading(true);
    const slowTimer = setTimeout(() => setSlow(true), 8000);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Something went wrong.");
      setMsgs((m) => [...m, { role: "assistant", content: data.reply || "Sorry, I didn't get an answer." }]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: (e as Error).message || "Network error.", error: true },
      ]);
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
    }
  }

  function retry() {
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMsgs((m) => {
      const cut = m.filter((x) => !x.error);
      cut.pop(); // remove the failed user message; send() adds it back
      return cut;
    });
    setTimeout(() => send(lastUser.content), 0);
  }

  function reset() {
    setMsgs([WELCOME]);
    setInput("");
  }

  const onlyWelcome = msgs.length === 1;

  return (
    <>
      <button
        className={`dhc-launcher ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open property assistant"}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {open && (
        <section className="dhc-panel" role="dialog" aria-label="DHA Property Assistant">
          <header className="dhc-header">
            <div className="dhc-avatar" aria-hidden>
              <HomeIcon />
            </div>
            <div className="dhc-title">
              <strong>DHA Property Assistant</strong>
              <span>
                <i className="dhc-dot" /> Live listings · all DHA Lahore phases
              </span>
            </div>
            <button className="dhc-icon-btn" onClick={reset} title="New chat" aria-label="New chat">
              <RefreshIcon />
            </button>
            <button className="dhc-icon-btn" onClick={() => setOpen(false)} title="Close" aria-label="Close">
              <CloseIcon />
            </button>
          </header>

          <div className="dhc-messages" ref={listRef} aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`dhc-row ${m.role}`}>
                <div className={`dhc-bubble ${m.error ? "error" : ""}`}>
                  {m.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                  {m.error && (
                    <button className="dhc-retry" onClick={retry}>
                      Try again
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="dhc-row assistant">
                <div className="dhc-bubble dhc-typing">
                  <span />
                  <span />
                  <span />
                  {slow && <em>Waking up the server, this can take up to a minute…</em>}
                </div>
              </div>
            )}

            {onlyWelcome && !loading && (
              <div className="dhc-chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="dhc-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={1000}
              placeholder="Ask about plots, prices, phases…"
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send">
              <SendIcon />
            </button>
          </form>
          <p className="dhc-foot">Listings from dhaconnects.com · verify details with the agent</p>
        </section>
      )}
    </>
  );
}

/* ---------- icons ---------- */
const svg = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ChatIcon = () => (
  <svg {...svg} width={26} height={26}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>
);
const CloseIcon = () => (
  <svg {...svg}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
const SendIcon = () => (
  <svg {...svg} width={20} height={20}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
);
const RefreshIcon = () => (
  <svg {...svg} width={18} height={18}><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" /></svg>
);
const HomeIcon = () => (
  <svg {...svg} width={20} height={20}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" /></svg>
);
