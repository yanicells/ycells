"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUOTES } from "../quotes";
import DesignNav from "../DesignNav";

/**
 * Design 5 — "The Terminal"
 * Raw monospace authenticity. Space Mono throughout.
 * Terminal-inspired with `>` prompt prefix, `//` quote prefix,
 * and a blinking cursor. Warm & human despite the code aesthetic.
 */
export default function Design5() {
  const [idx, setIdx] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCursorVisible((v) => !v), 530);
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
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          width: "100%",
          fontFamily: "var(--font-space-mono), monospace",
        }}
      >
        {/* Line numbers gutter + title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          {/* Gutter */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              color: "#C4B8A8",
              fontSize: "0.75rem",
              lineHeight: "1.8",
              userSelect: "none",
              textAlign: "right",
              minWidth: "24px",
            }}
          >
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>

          {/* Code body */}
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#9A9080",
                lineHeight: "1.8",
                marginBottom: "4px",
              }}
            >
              {"// a quiet corner of the internet"}
            </div>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 5vw, 3rem)",
                fontWeight: 700,
                color: "#1A1A1A",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: "4px",
              }}
            >
              <span style={{ color: "#B89B6A" }}>&gt; </span>
              mental_health_matters
              <span
                style={{
                  opacity: cursorVisible ? 1 : 0,
                  transition: "opacity 0.1s",
                  color: "#B89B6A",
                  fontWeight: 400,
                }}
              >
                _
              </span>
            </h1>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#C4B8A8",
                lineHeight: "1.8",
              }}
            >
              {"---"}
            </div>
          </div>
        </motion.div>

        {/* Quote as comment block */}
        <div style={{ minHeight: "100px", paddingLeft: "48px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <blockquote
                style={{
                  fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
                  lineHeight: 1.8,
                  color: "#5A5A5A",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#B89B6A" }}>{"// "}</span>
                &quot;{QUOTES[idx].text}&quot;
              </blockquote>
              <cite
                style={{
                  fontStyle: "normal",
                  fontSize: "0.8rem",
                  color: "#9A9080",
                  display: "block",
                }}
              >
                <span style={{ color: "#B89B6A" }}>{"// "}</span>— {QUOTES[idx].attribution}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Process bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            marginTop: "64px",
            paddingLeft: "48px",
            fontSize: "0.7rem",
            color: "#C4B8A8",
          }}
        >
          [{idx + 1}/{QUOTES.length}] cycling...
        </motion.div>
      </div>

      <DesignNav current={5} />
    </main>
  );
}
