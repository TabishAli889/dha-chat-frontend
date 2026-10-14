# 🏠 DHA Property Assistant (Frontend)

A modern, lightweight floating chat widget built with **Next.js** and **TypeScript**. This frontend serves as the user interface for the DHA Lahore Property Assistant, allowing users to query real-time property listings, prices, and phase details.

## 🌟 Features

- **Floating Widget**: A non-intrusive chat launcher that can be embedded into any existing website.
- **Real-time Queries**: Integration with a FastAPI backend that leverages Groq LLM and the `dhaconnects` API.
- **Smart Suggestions**: Quick-start chips to help users discover how to ask about plots, houses, and commercial properties.
- **Rich Formatting**: Support for Markdown and GFM (GitHub Flavored Markdown) for clean, readable property lists and tables.
- **Session Persistence**: Chat history is stored in `localStorage`, ensuring conversations are preserved across page refreshes.
- **Server-Side Proxy**: Uses Next.js API routes to mask the backend URL and eliminate CORS issues.
- **Responsive Design**: Fully mobile-optimized interface with auto-expanding text inputs.

## 🚀 Quickstart

### 1. Prerequisites
- Node.js (v18 or later)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Configuration
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
Open `.env.local` and set your backend URL:
```env
# Use this for the production Render backend
BACKEND_URL=https://dha-chatbot.onrender.com

# OR use this if running the FastAPI backend locally
# BACKEND_URL=http://127.0.0.1:8000
```

### 4. Run Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) and click the chat icon in the bottom-right corner.

---

## 🛠️ Technical Architecture

### Data Flow
`User Input` $\rightarrow$ `ChatWidget.tsx` $\rightarrow$ `/api/chat` (Next.js Proxy) $\rightarrow$ `FastAPI Backend` $\rightarrow$ `Groq LLM + DHA API` $\rightarrow$ `Response`

### Key Files
- **`components/ChatWidget.tsx`**: The core UI component handling state, message rendering, and API calls.
- **`app/api/chat/route.ts`**: A server-side proxy that forwards requests to the backend to keep the `BACKEND_URL` secure.
- **`app/page.tsx`**: A demo landing page showcasing the widget in action.
- **`app/theme.css`**: Centralized styling for colors, fonts, and branding.

## 📦 Deployment

### Vercel (Recommended)
1. Push your code to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variable `BACKEND_URL` in the Vercel dashboard.
4. Deploy.

### Integration into Existing Sites
To add this bot to another Next.js project:
1. Copy `components/ChatWidget.tsx`.
2. Copy the `app/api/chat/route.ts` logic to your API folder.
3. Import the styles from `app/theme.css` and `app/globals.css`.
4. Place the `<ChatWidget />` component in your root `layout.tsx`.

## 🎨 Customization
All visual aspects (colors, corner radius, fonts) are managed in `app/theme.css`. You can easily rebrand the bot by modifying the CSS variables in that file.
