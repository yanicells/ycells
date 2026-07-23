export default function Home() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem) 2rem",
        gap: "0.75rem",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.4rem, 9vw, 4.75rem)",
          letterSpacing: "0.04em",
          lineHeight: 0.95,
          textAlign: "center",
          color: "var(--bone)",
          textShadow: "0 0 40px rgba(196, 168, 130, 0.18)",
          textTransform: "uppercase",
        }}
      >
        Tung Tung Tung Sahur
      </h1>
      <p
        style={{
          margin: 0,
          maxWidth: "28rem",
          textAlign: "center",
          fontSize: "clamp(0.85rem, 2.4vw, 1rem)",
          color: "var(--ash-muted)",
          letterSpacing: "0.02em",
        }}
      >
        he has a bat. you have WASD. good luck.
      </p>
      <div
        id="game-mount"
        style={{
          width: "min(960px, 100%)",
          flex: 1,
          minHeight: "min(62dvh, 560px)",
          marginTop: "0.5rem",
        }}
      />
    </main>
  );
}
