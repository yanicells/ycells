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
        <p
          style={{
            margin: "0.15rem 0 0",
            textAlign: "center",
            fontSize: "clamp(0.62rem, 1.4vw, 0.72rem)",
            color: "var(--ash-muted)",
            opacity: 0.75,
            letterSpacing: "0.01em",
            maxWidth: "42rem",
          }}
        >
          Model:{" "}
          <a
            href="https://sketchfab.com/3d-models/tung-tung-tung-sahur-91ddd9079bd84019ba4a12e01d93a0d6"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--bone-dim)", textDecoration: "underline" }}
          >
            Tung Tung Tung Sahur
          </a>{" "}
          by{" "}
          <a
            href="https://sketchfab.com/Eks.Art"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--bone-dim)", textDecoration: "underline" }}
          >
            Eks.Art
          </a>
          ,{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--bone-dim)", textDecoration: "underline" }}
          >
            CC BY 4.0
          </a>
          {" "}· adapted for this game
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
