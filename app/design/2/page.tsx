"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUOTES } from "../quotes";
import DesignNav from "../DesignNav";

/**
 * Design 2 — "The Breath"
 * Zen minimalism. Cormorant Garamond at ultra-light weight.
 * Meditative pacing with very slow crossfades and a gentle
 * breathing pulse on the title. Maximum whitespace.
 */
export default function Design2() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 10000);
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
        padding: "40px 24px 100px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        {/* Breathing title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            scale: [1, 1.015, 1],
          }}
          transition={{
            opacity: { duration: 2, ease: "easeOut" },
            scale: {
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(3rem, 9vw, 6.5rem)",
            fontWeight: 300,
            color: "#3A3A3A",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            marginBottom: "48px",
          }}
        >
          Mental Health Matters
        </motion.h1>

        {/* Centered dot ornament */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 1 }}
          style={{
            fontSize: "0.5rem",
            color: "#C4B8A8",
            marginBottom: "48px",
            letterSpacing: "0.5em",
          }}
        >
          ·&ensp;·&ensp;·
        </motion.div>

        {/* Slow-fade quote */}
        <div
          style={{
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              style={{ textAlign: "center" }}
            >
              <blockquote
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontStyle: "normal",
                  fontWeight: 400,
                  fontSize: "clamp(1rem, 2.2vw, 1.3rem)",
                  lineHeight: 1.9,
                  color: "#5A5A5A",
                  maxWidth: "480px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginBottom: "14px",
                }}
              >
                {QUOTES[idx].text}
              </blockquote>
              <cite
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                  color: "#A0978A",
                }}
              >
                — {QUOTES[idx].attribution}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <DesignNav current={2} />
    </main>
  );
}
