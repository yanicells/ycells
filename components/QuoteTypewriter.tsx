"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const QUOTES = [
  {
    text: "Life is here for us to be kinder.",
    attribution: "Shoko Komi, Bunny Girl Senpai",
  },
  {
    text: "You don't have to earn rest.",
    attribution: "Unknown",
  },
  {
    text: "Healing isn't linear. Some days you go backwards, and that still counts.",
    attribution: "Unknown",
  },
  {
    text: "It's okay to not have it figured out. Most people don't.",
    attribution: "Unknown",
  },
  {
    text: "Be gentle. Everyone you meet is carrying something heavy.",
    attribution: "Unknown",
  },
  {
    text: "Your bad days are not your whole story.",
    attribution: "Unknown",
  },
];

const TYPE_SPEED = 38;
const ERASE_SPEED = 20;
const PAUSE_AFTER_TYPE = 2800;
const PAUSE_AFTER_ERASE = 500;

export default function QuoteTypewriter({ startDelay = 0 }: { startDelay?: number }) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "typing" | "pausing" | "erasing" | "waiting">(
    startDelay > 0 ? "idle" : "typing"
  );
  const [cursorVisible, setCursorVisible] = useState(true);

  // Show attribution once the full quote is typed out
  const showAttribution =
    phase !== "erasing" &&
    phase !== "waiting" &&
    displayed.length > 0 &&
    displayed === QUOTES[quoteIdx].text;

  // Start delay
  useEffect(() => {
    if (phase !== "idle") return;
    const t = setTimeout(() => setPhase("typing"), startDelay);
    return () => clearTimeout(t);
  }, [phase, startDelay]);

  // Blinking cursor
  useEffect(() => {
    const t = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  // Typing
  useEffect(() => {
    if (phase !== "typing") return;
    const full = QUOTES[quoteIdx].text;
    if (charIdx < full.length) {
      const t = setTimeout(() => {
        setDisplayed(full.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, TYPE_SPEED);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase("erasing"), PAUSE_AFTER_TYPE);
      return () => clearTimeout(t);
    }
  }, [phase, charIdx, quoteIdx]);

  // Erasing
  useEffect(() => {
    if (phase !== "erasing") return;
    if (charIdx > 0) {
      const t = setTimeout(() => {
        setCharIdx((c) => c - 1);
        setDisplayed(QUOTES[quoteIdx].text.slice(0, charIdx - 1));
      }, ERASE_SPEED);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setQuoteIdx((i) => (i + 1) % QUOTES.length);
        setPhase("typing");
      }, PAUSE_AFTER_ERASE);
      return () => clearTimeout(t);
    }
  }, [phase, charIdx, quoteIdx]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "120px",
      }}
    >
      {/* Opening quote mark */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-playfair), serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          color: "#D4C5B0",
          lineHeight: 1,
          marginBottom: "4px",
          display: "block",
        }}
      >
        &ldquo;
      </span>

      <blockquote
        aria-live="polite"
        style={{
          fontFamily: "var(--font-serif), serif",
          fontStyle: "italic",
          fontSize: "clamp(1.1rem, 2.5vw, 1.45rem)",
          lineHeight: 1.75,
          color: "#3A3A3A",
          maxWidth: "560px",
          textAlign: "center",
          marginBottom: "20px",
          minHeight: "4em",
        }}
      >
        {displayed}
        <span
          aria-hidden="true"
          style={{
            opacity: cursorVisible ? 1 : 0,
            transition: "opacity 0.1s",
            fontStyle: "normal",
            fontWeight: 300,
            color: "#C4AA78",
          }}
        >
          |
        </span>
      </blockquote>

      <motion.cite
        animate={{ opacity: showAttribution ? 1 : 0, y: showAttribution ? 0 : 6 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          fontStyle: "normal",
          fontSize: "0.72rem",
          color: "#9A9080",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          display: "block",
        }}
      >
        {QUOTES[quoteIdx].attribution}
      </motion.cite>
    </div>
  );
}
