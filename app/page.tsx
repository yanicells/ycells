import SahurGameLoader from "@/components/game/SahurGameLoader";

export default function Home() {
  return (
    <main
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        padding: "clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 2.5vw, 1.5rem)",
        gap: "0.55rem",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.2rem",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.55rem, 4.8vw, 2.6rem)",
            letterSpacing: "0.05em",
            lineHeight: 1,
            textAlign: "center",
            color: "var(--bone)",
            textShadow: "0 0 36px rgba(212, 184, 150, 0.22)",
            textTransform: "uppercase",
          }}
        >
          Tung Tung Tung Sahur
        </h1>
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "clamp(0.78rem, 1.8vw, 0.92rem)",
            color: "var(--ash-muted)",
            letterSpacing: "0.02em",
          }}
        >
          he has a bat. you have WASD. good luck.
        </p>
      </header>
      <div
        id="game-mount"
        style={{
          width: "100%",
          maxWidth: 1280,
          marginInline: "auto",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SahurGameLoader />
      </div>
    </main>
  );
}
