"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUOTES } from "../quotes";
import DesignNav from "../DesignNav";

/**
 * Design 1 — "The Journal"
 * Classic editorial elegance. Playfair Display hero,
 * thin gold rule, single rotating quote. Newspaper front-page energy.
 */
export default function Design1() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  const ease: [number, number, number, number] = [0.0, 0.0, 0.2, 1.0];

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px 100px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(3.5rem, 10vw, 8rem)",
            fontWeight: 700,
            color: "#1A1A1A",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            marginBottom: "40px",
          }}
        >
          Mental Health
          <br />
          Matters
        </motion.h1>

        {/* Thin gold rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
          style={{
            width: "100px",
            height: "1px",
            background: "#C4AA78",
            margin: "0 auto 52px",
            transformOrigin: "center",
          }}
        />

        {/* Rotating quote */}
        <div
          style={{
            minHeight: "140px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease }}
              style={{ textAlign: "center" }}
            >
              <blockquote
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                  lineHeight: 1.7,
                  color: "#3A3A3A",
                  marginBottom: "16px",
                  maxWidth: "560px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                &ldquo;{QUOTES[idx].text}&rdquo;
              </blockquote>
              <cite
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontStyle: "normal",
                  fontSize: "0.72rem",
                  color: "#9A9080",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {QUOTES[idx].attribution}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quote counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          style={{
            marginTop: "56px",
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.65rem",
            color: "#C4B8A8",
            letterSpacing: "0.12em",
          }}
        >
          {String(idx + 1).padStart(2, "0")} / {String(QUOTES.length).padStart(2, "0")}
        </motion.div>
      </div>

      <DesignNav current={1} />
    </main>
  );
}
