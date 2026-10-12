import { NextRequest, NextResponse } from "next/server";

// Proxies the browser to the FastAPI bot, so the backend URL stays private
// and there are no CORS problems.
const BACKEND = (process.env.BACKEND_URL || "https://dha-chatbot.onrender.com").replace(/\/$/, "");

export const maxDuration = 60; // Render free plan can take ~50s to wake up

export async function POST(req: NextRequest) {
  let body: { message?: string; history?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const message = (body.message || "").trim();
  if (!message) return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  if (message.length > 1000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });

  try {
    const r = await fetch(`${BACKEND}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: (body.history || []).slice(-10) }),
      signal: AbortSignal.timeout(58_000),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const d = data.detail;
      const detail =
        typeof d === "string" ? d
        : Array.isArray(d) ? d.map((x: { msg?: string; loc?: unknown[] }) => `${(x.loc || []).join(".")}: ${x.msg}`).join("; ")
        : d ? JSON.stringify(d) : "";
      console.error(`[chat] backend ${BACKEND}/chat returned ${r.status}: ${detail}`);
      return NextResponse.json(
        { error: `Backend error ${r.status}${detail ? `: ${detail}` : ""}` },
        { status: 502 },
      );
    }
    return NextResponse.json({ reply: data.reply ?? "" });
  } catch {
    return NextResponse.json(
      { error: "The assistant is taking too long to respond. Please try again in a moment." },
      { status: 504 },
    );
  }
}