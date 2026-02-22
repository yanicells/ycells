"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUOTES } from "../quotes";
import DesignNav from "../DesignNav";

/**
 * Design 3 — "The Bold"
 * Powerful typographic statement. Massive uppercase title in
 * Source Serif 4 at weight 900. Tight leading, tight tracking.
 * Quote positioned below a bold accent bar.
 */
export default function Design3() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 7000);
    return () => clearInterval(t);
  }, []);

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 32px 100px",
      }}
    >
      <div style={{ maxWidth: "1100px", width: "100%" }}>
        {/* Massive uppercase title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease }}
          style={{
            fontFamily: "var(--font-serif), serif",
            fontSize: "clamp(3rem, 13vw, 11rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            color: "#1A1A1A",
            lineHeight: 0.88,
            letterSpacing: "-0.04em",
            marginBottom: "32px",
          }}
        >
          Mental
          <br />
          Health
          <br />
          Matters
        </motion.h1>

        {/* Bold accent bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease }}
          style={{
            width: "72px",
            height: "4px",
            background: "#B89B6A",
            marginBottom: "40px",
            transformOrigin: "left",
            borderRadius: "2px",
          }}
        />

        {/* Quote */}
        <div
          style={{
            minHeight: "100px",
            maxWidth: "440px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.5, ease }}
            >
              <blockquote
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                  lineHeight: 1.75,
                  color: "#4A4A4A",
                  marginBottom: "12px",
                }}
              >
                &ldquo;{QUOTES[idx].text}&rdquo;
              </blockquote>
              <cite
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontStyle: "italic",
                  fontSize: "0.8rem",
                  color: "#8A8A7A",
                }}
              >
                — {QUOTES[idx].attribution}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <DesignNav current={3} />
    </main>
  );
}
