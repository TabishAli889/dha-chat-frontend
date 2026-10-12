# DHA Property Assistant — Next.js frontend

Floating chat widget for the DHA chatbot (FastAPI + Groq backend).

## Run locally (VS Code terminal)

```bash
npm install
cp .env.example .env.local      # Windows: copy .env.example .env.local
npm run dev
```

Open http://localhost:3000 and click the chat button in the bottom-right.

To use your local backend instead of Render, set this in `.env.local`:

```
BACKEND_URL=http://127.0.0.1:8000
```

## How it works

```
Browser ──► /api/chat (Next.js route) ──► BACKEND_URL/chat (FastAPI) ──► Groq + dhaconnects API
```

- `components/ChatWidget.tsx` — the widget: launcher, panel, messages, suggestions, markdown, retry.
- `app/api/chat/route.ts` — server-side proxy, so the backend URL stays private and there are no CORS issues.
- `app/theme.css` — **all colors, font and corner radius.** Change these to restyle the whole bot.

Chat history is kept in the browser (localStorage) and the last 10 turns are sent with each message.

## Deploy (Vercel)

1. Push this folder to GitHub.
2. Import it on vercel.com.
3. Add environment variable `BACKEND_URL=https://dha-chatbot.onrender.com`.
4. Deploy.

## Add to an existing Next.js site

Copy `components/ChatWidget.tsx`, `app/api/chat/route.ts`, and the styles from
`app/theme.css` + `app/globals.css` (everything from "launcher" down), then put
`<ChatWidget />` in your root `layout.tsx`.
