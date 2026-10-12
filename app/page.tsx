import ChatWidget from "@/components/ChatWidget";

// Demo page. On the real site, only <ChatWidget /> is needed (see README).
export default function Home() {
  return (
    <main className="demo">
      <section className="demo-hero">
        <span className="demo-badge">DHA Lahore · 14 phases · live listings</span>
        <h1>DHA Property Assistant</h1>
        <p>
          Ask about plots, houses and commercial property for sale or rent in any DHA Lahore phase.
          Click the chat button in the corner to start.
        </p>
      </section>
      <ChatWidget />
    </main>
  );
}
