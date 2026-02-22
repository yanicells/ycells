"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUOTES } from "../quotes";
import DesignNav from "../DesignNav";

/**
 * Design 6 — "The Split"
 * Magazine-style two-column layout. Left column: massive title
 * with "Matters" in bold contrast. Right column: single floating
 * quote card. Vertical dividing line. Stacks on mobile.
 */
export default function Design6() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  const ease: [number, number, number, number] = [0.0, 0.0, 0.2, 1.0];

  return (
    <>
      <style>{`
        .split-layout {
          display: flex;
          flex-direction: column;
          gap: 48px;
          align-items: center;
        }
        .split-divider {
          display: none;
        }
        @media (min-width: 768px) {
          .split-layout {
            flex-direction: row;
            gap: 0;
            align-items: center;
          }
          .split-divider {
            display: block;
          }
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 32px 100px",
        }}
      >
        <div
          className="split-layout"
          style={{ maxWidth: "1100px", width: "100%" }}
        >
          {/* Left — Title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease }}
            style={{
              flex: 1,
              paddingRight: "clamp(16px, 4vw, 60px)",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-cormorant), serif",
                lineHeight: 1.05,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  fontWeight: 300,
                  color: "#5A5A5A",
                  letterSpacing: "-0.01em",
                }}
              >
                Mental Health
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  letterSpacing: "-0.02em",
                  marginTop: "-4px",
                }}
              >
                Matters
              </span>
            </h1>
          </motion.div>

          {/* Vertical divider */}
          <motion.div
            className="split-divider"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            style={{
              width: "1px",
              height: "200px",
              background: "#D4C5B0",
              transformOrigin: "top",
              flexShrink: 0,
            }}
          />

          {/* Right — Quote */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            style={{
              flex: 1,
              paddingLeft: "clamp(16px, 4vw, 60px)",
              minHeight: "160px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease }}
                style={{
                  padding: "32px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.35)",
                  boxShadow: "0 2px 24px rgba(0,0,0,0.03)",
                  border: "1px solid rgba(212,197,176,0.25)",
                  width: "100%",
                }}
              >
                <blockquote
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    fontStyle: "italic",
                    fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                    lineHeight: 1.7,
                    color: "#3A3A3A",
                    marginBottom: "16px",
                  }}
                >
                  &ldquo;{QUOTES[idx].text}&rdquo;
                </blockquote>
                <cite
                  style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontStyle: "normal",
                    fontSize: "0.75rem",
                    color: "#9A9080",
                    letterSpacing: "0.06em",
                  }}
                >
                  — {QUOTES[idx].attribution}
                </cite>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <DesignNav current={6} />
      </main>
    </>
  );
}
