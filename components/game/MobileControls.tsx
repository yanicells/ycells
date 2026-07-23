"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

type Props = {
  onDir: (axis: "x" | "y", value: number) => void;
  onRestart: () => void;
  dead: boolean;
};

const btn: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 8,
  border: "1px solid rgba(196, 168, 130, 0.35)",
  background: "rgba(18, 16, 14, 0.85)",
  color: "#e8e4df",
  fontFamily: "var(--font-hud)",
  fontSize: 18,
  touchAction: "none",
  userSelect: "none",
  display: "grid",
  placeItems: "center",
  WebkitTapHighlightColor: "transparent",
};

export default function MobileControls({ onDir, onRestart, dead }: Props) {
  function bind(axis: "x" | "y", value: number) {
    return {
      onPointerDown: (e: ReactPointerEvent) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        onDir(axis, value);
      },
      onPointerUp: (e: ReactPointerEvent) => {
        e.preventDefault();
        onDir(axis, 0);
      },
      onPointerCancel: () => onDir(axis, 0),
    };
  }

  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "1rem",
        padding: "0.75rem 0.25rem 0",
        width: "100%",
        maxWidth: 960,
        pointerEvents: "auto",
      }}
      className="sahur-mobile-controls"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "52px 52px 52px",
          gridTemplateRows: "52px 52px 52px",
          gap: 6,
        }}
      >
        <span />
        <button type="button" style={btn} {...bind("y", -1)} aria-label="Up">
          ▲
        </button>
        <span />
        <button type="button" style={btn} {...bind("x", -1)} aria-label="Left">
          ◀
        </button>
        <button type="button" style={btn} {...bind("y", 1)} aria-label="Down">
          ▼
        </button>
        <button type="button" style={btn} {...bind("x", 1)} aria-label="Right">
          ▶
        </button>
      </div>

      {dead ? (
        <button
          type="button"
          onClick={onRestart}
          style={{
            ...btn,
            width: "auto",
            padding: "0 1rem",
            minWidth: 96,
            color: "#c45c4a",
            borderColor: "rgba(196, 92, 74, 0.55)",
          }}
        >
          RESTART
        </button>
      ) : (
        <div
          style={{
            ...btn,
            width: "auto",
            minWidth: 96,
            padding: "0 0.75rem",
            fontSize: 11,
            color: "#9a9590",
            borderStyle: "dashed",
          }}
        >
          dodge
        </div>
      )}

      <style>{`
        .sahur-mobile-controls { display: flex; }
        @media (min-width: 820px) {
          .sahur-mobile-controls { display: none !important; }
        }
      `}</style>
    </div>
  );
}
