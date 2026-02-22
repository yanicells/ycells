"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "A quiet corner of the internet reminding you to slow down.",
  "A reminder to be a little kinder — to yourself and everyone around you.",
  "You don't have to have it all figured out right now.",
  "Healing takes time. You're allowed to take yours.",
];

const TYPE_SPEED = 40; // ms per character when typing
const ERASE_SPEED = 25; // ms per character when erasing
const PAUSE_AFTER_TYPE = 1500; // ms pause when fully typed
const PAUSE_AFTER_ERASE = 500; // ms pause before next phrase

interface TypewriterProps {
  /** Delay (ms) before the typewriter starts its first cycle */
  startDelay?: number;
}

/**
 * Cycles through PHRASES with a typewriter effect:
 * type in -> pause -> erase -> pause -> next phrase
 */
export default function Typewriter({ startDelay = 0 }: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<
    "idle" | "typing" | "pausing" | "erasing" | "waiting"
  >(startDelay > 0 ? "idle" : "typing");
  const [cursorVisible, setCursorVisible] = useState(true);

  // Start delay before first cycle
  useEffect(() => {
    if (phase !== "idle") return;
    const t = setTimeout(() => setPhase("typing"), startDelay);
    return () => clearTimeout(t);
  }, [phase, startDelay]);

  // Blinking cursor — independent of typing phase
  useEffect(() => {
    const t = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  // Typing phase
  useEffect(() => {
    if (phase !== "typing") return;
    const currentPhrase = PHRASES[phraseIndex];
    if (charIndex < currentPhrase.length) {
      const t = setTimeout(() => {
        setDisplayed(currentPhrase.slice(0, charIndex + 1));
        setCharIndex((i) => i + 1);
      }, TYPE_SPEED);
      return () => clearTimeout(t);
    } else {
      // Fully typed — pause
      const t = setTimeout(() => setPhase("erasing"), PAUSE_AFTER_TYPE);
      return () => clearTimeout(t);
    }
  }, [phase, charIndex, phraseIndex]);

  // Erasing phase
  useEffect(() => {
    if (phase !== "erasing") return;
    if (charIndex > 0) {
      const t = setTimeout(() => {
        setCharIndex((i) => i - 1);
        setDisplayed(PHRASES[phraseIndex].slice(0, charIndex - 1));
      }, ERASE_SPEED);
      return () => clearTimeout(t);
    } else {
      // Fully erased — wait before next
      const t = setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % PHRASES.length);
        setPhase("typing");
      }, PAUSE_AFTER_ERASE);
      return () => clearTimeout(t);
    }
  }, [phase, charIndex, phraseIndex]);

  return (
    <p
      aria-live="polite"
      aria-label="Rotating description"
      style={{
        fontFamily: "var(--font-inter), sans-serif",
        color: "#6B6B6B",
        fontSize: "1.0625rem",
        lineHeight: "1.75",
        minHeight: "1.75rem",
        letterSpacing: "0.01em",
      }}
    >
      {displayed}
      <span
        aria-hidden="true"
        style={{
          opacity: cursorVisible ? 1 : 0,
          transition: "opacity 0.1s",
          fontWeight: 300,
          color: "#D4C5B0",
        }}
      >
        |
      </span>
    </p>
  );
}
