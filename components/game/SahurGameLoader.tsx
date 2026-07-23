"use client";

import dynamic from "next/dynamic";

const SahurGame = dynamic(() => import("./SahurGame"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 320,
        display: "grid",
        placeItems: "center",
        color: "var(--ash-muted)",
        fontFamily: "var(--font-hud)",
        border: "1px solid rgba(212, 184, 150, 0.22)",
        background: "var(--void)",
      }}
    >
      summoning sahur…
    </div>
  ),
});

export default function SahurGameLoader() {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0, display: "flex" }}>
      <SahurGame />
    </div>
  );
}
