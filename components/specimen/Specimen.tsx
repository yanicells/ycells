"use client";

import { useEffect, useRef, useState } from "react";

export default function Specimen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;

    // The static specimen is visible while the 3D engine loads separately.
    import("./scene")
      .then(({ mountSpecimen }) => {
        if (cancelled || !canvasRef.current) return;
        dispose = mountSpecimen(
          canvasRef.current,
          () => setReady(true),
          () => setReady(false),
        );
      })
      .catch(() => {
        // The poster also covers disabled WebGL, GPU failures, and offline chunks.
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div className="specimen" data-ready={ready}>
      {/* A plain image keeps the no-JavaScript fallback independent of hydration. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="specimen-poster"
        src="/specimen.webp"
        alt="A pale, rough mineral specimen threaded with deep red crystals."
        width={1000}
        height={1000}
        fetchPriority="high"
        aria-hidden={ready}
      />
      <canvas
        ref={canvasRef}
        className="specimen-canvas"
        tabIndex={ready ? 0 : -1}
        role="img"
        aria-label="Interactive mineral specimen. Drag or use arrow keys to rotate. Scroll, pinch, or use plus and minus to zoom. Double-click or press Home to reset."
        aria-hidden={!ready}
      />
    </div>
  );
}
