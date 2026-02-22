"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUOTES } from "../quotes";
import DesignNav from "../DesignNav";

/**
 * Design 4 — "The Stack"
 * Modern art poster. Three words stacked vertically with varying
 * weights creating visual rhythm. Staggered entrance from the left.
 * Quote offset to the side with an accent border.
 */
const WORDS = [
  { text: "Mental", weight: 400, color: "#1A1A1A" },
  { text: "Health", weight: 600, color: "#8B7355" },
  { text: "Matters", weight: 900, color: "#1A1A1A" },
];

export default function Design4() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 32px 100px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "64px",
        }}
      >
        {/* Stacked title */}
        <div>
          {WORDS.map((word, i) => (
            <motion.div
              key={word.text}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: i * 0.18,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "clamp(3.5rem, 12vw, 9rem)",
                fontWeight: word.weight,
                color: word.color,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
              }}
            >
              {word.text}
            </motion.div>
          ))}
        </div>

        {/* Quote with accent border */}
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: "420px",
            minHeight: "100px",
            paddingLeft: "24px",
            borderLeft: "3px solid #D4C5B0",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <blockquote
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
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
                  fontStyle: "normal",
                  fontSize: "0.75rem",
                  color: "#9A9080",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {QUOTES[idx].attribution}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <DesignNav current={4} />
    </main>
  );
}
