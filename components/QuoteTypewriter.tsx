"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const QUOTES = [
  {
    text: "Life is here for us to be kinder.",
    attribution: "Shoko Komi, Bunny Girl Senpai",
  },
  {
    text: "Maybe... just maybe, the light can reach even the bottom of a dark ocean.",
    attribution: "Kousei Arima, Your Lie in April",
  },
  {
    text: "No matter how hurt someone is, they're meant to overcome it and try to go forward.",
    attribution: "Mirajane Strauss, Fairy Tail",
  },
  {
    text: "Once you've met someone, you never really forget them. It just takes a while for your memories to return.",
    attribution: "Zeniba, Spirited Away",
  },
  {
    text: "Talk to yourself like you would to someone you love.",
    attribution: "Brené Brown, The Gifts of Imperfection",
  },
  {
    text: "There is hope, even when your brain tells you there isn't.",
    attribution: "John Green, Turtles All the Way Down",
  },
  {
    text: "The world breaks everyone, and afterward, some are strong at the broken places.",
    attribution: "Ernest Hemingway, A Farewell to Arms",
  },
  {
    text: "Even the darkest night will end and the sun will rise.",
    attribution: "Victor Hugo, Les Misérables",
  },
  {
    text: "The flower that blooms in adversity is the most rare and beautiful of all.",
    attribution: "The Emperor, Mulan (1998)",
  },
  {
    text: "There's no person in the whole world like you, and I like you just the way you are.",
    attribution: "Fred Rogers, Mister Rogers' Neighborhood",
  },
  {
    text: "We accept the love we think we deserve.",
    attribution: "Stephen Chbosky, The Perks of Being a Wallflower",
  },
];

const TYPE_SPEED = 38;
const ERASE_SPEED = 20;
const PAUSE_AFTER_TYPE = 3500;
const PAUSE_AFTER_ERASE = 500;

export default function QuoteTypewriter({
  startDelay = 0,
}: {
  startDelay?: number;
}) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [phase, setPhase] = useState<
    "idle" | "typing" | "pausing" | "erasing" | "waiting"
  >(startDelay > 0 ? "idle" : "typing");
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
        animate={{
          opacity: showAttribution ? 1 : 0,
          y: showAttribution ? 0 : 6,
        }}
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
