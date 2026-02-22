"use client";

import Link from "next/link";

const DESIGNS = [
  { id: 1, label: "Journal" },
  { id: 2, label: "Breath" },
  { id: 3, label: "Bold" },
  { id: 4, label: "Stack" },
  { id: 5, label: "Terminal" },
  { id: 6, label: "Split" },
  { id: 7, label: "Cascade" },
];

export default function DesignNav({ current }: { current: number }) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "4px",
        zIndex: 100,
        padding: "6px 12px",
        borderRadius: "999px",
        background: "rgba(246, 241, 235, 0.9)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(212, 197, 176, 0.4)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      {DESIGNS.map(({ id, label }) => (
        <Link
          key={id}
          href={`/design/${id}`}
          title={label}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.7rem",
            fontWeight: id === current ? 600 : 400,
            color: id === current ? "#1A1A1A" : "#9A9080",
            background: id === current ? "#D4C5B0" : "transparent",
            textDecoration: "none",
            transition: "all 0.25s ease",
          }}
        >
          {id}
        </Link>
      ))}
    </nav>
  );
}
