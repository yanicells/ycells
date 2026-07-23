"use client";

import dynamic from "next/dynamic";

const SahurGame = dynamic(() => import("./SahurGame"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 280,
        display: "grid",
        placeItems: "center",
        color: "var(--ash-muted)",
        fontFamily: "var(--font-hud)",
        border: "1px solid rgba(196, 168, 130, 0.18)",
        background: "var(--void)",
      }}
    >
      summoning sahur…
    </div>
  ),
});

export default function SahurGameLoader() {
  return <SahurGame />;
}
