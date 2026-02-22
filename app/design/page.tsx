import Link from "next/link";

const DESIGNS = [
  { id: 1, name: "The Journal", desc: "Classic editorial elegance with Playfair Display" },
  { id: 2, name: "The Breath", desc: "Zen minimalism with meditative pacing" },
  { id: 3, name: "The Bold", desc: "Powerful typographic statement" },
  { id: 4, name: "The Stack", desc: "Modern poster with stacked words" },
  { id: 5, name: "The Terminal", desc: "Raw monospace authenticity" },
  { id: 6, name: "The Split", desc: "Magazine-style two-column layout" },
  { id: 7, name: "The Cascade", desc: "Flowing, indented poetry" },
];

export default function DesignIndex() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-serif), serif",
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          fontWeight: 700,
          color: "#1A1A1A",
          marginBottom: "12px",
          letterSpacing: "-0.01em",
        }}
      >
        Design Variants
      </h1>
      <p
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: "0.875rem",
          color: "#8A8A7A",
          marginBottom: "48px",
        }}
      >
        7 takes on &ldquo;Mental Health Matters&rdquo;
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px",
          width: "100%",
          maxWidth: "720px",
        }}
      >
        {DESIGNS.map((d) => (
          <Link
            key={d.id}
            href={`/design/${d.id}`}
            style={{
              display: "block",
              padding: "24px",
              borderRadius: "8px",
              border: "1px solid rgba(212,197,176,0.4)",
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.25s ease",
              background: "rgba(255,255,255,0.3)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.7rem",
                color: "#B0A898",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Design {d.id}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-serif), serif",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1A1A1A",
                margin: "6px 0 8px",
              }}
            >
              {d.name}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.8rem",
                color: "#8A8A7A",
                lineHeight: 1.5,
              }}
            >
              {d.desc}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
