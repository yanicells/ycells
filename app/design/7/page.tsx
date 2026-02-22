"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUOTES } from "../quotes";
import DesignNav from "../DesignNav";

/**
 * Design 7 — "The Cascade"
 * Flowing, indented poetry. Each word of the title is offset
 * to create a stepping/cascading rhythm. Source Serif italic
 * with staggered entrance animations. Quote below with ornamental divider.
 */
const STEPS = [
  { text: "Mental", indent: "0%" },
  { text: "Health", indent: "12%" },
  { text: "Matters", indent: "28%" },
];

export default function Design7() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px 100px",
      }}
    >
      <div style={{ maxWidth: "800px", width: "100%" }}>
        {/* Cascading title */}
        <div style={{ marginBottom: "64px" }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.text}
              initial={{ opacity: 0, y: 20, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                paddingLeft: step.indent,
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontStyle: "italic",
                  fontSize: "clamp(3rem, 9vw, 6.5rem)",
                  fontWeight: 400,
                  color: i === 2 ? "#1A1A1A" : "#5A5A5A",
                  lineHeight: 1.0,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {step.text}
              </h1>
            </motion.div>
          ))}
        </div>

        {/* Ornamental divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          style={{
            textAlign: "center",
            marginBottom: "48px",
            color: "#C4B8A8",
            fontSize: "1.2rem",
            letterSpacing: "0.4em",
          }}
        >
          — &ensp; — &ensp; —
        </motion.div>

        {/* Quote */}
        <div
          style={{
            textAlign: "center",
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ textAlign: "center" }}
            >
              <blockquote
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontWeight: 400,
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  lineHeight: 1.8,
                  color: "#3A3A3A",
                  maxWidth: "500px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginBottom: "16px",
                }}
              >
                &ldquo;{QUOTES[idx].text}&rdquo;
              </blockquote>
              <cite
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontStyle: "normal",
                  fontSize: "0.72rem",
                  color: "#A0978A",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {QUOTES[idx].attribution}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <DesignNav current={7} />
    </main>
  );
}
