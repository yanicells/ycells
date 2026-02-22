"use client";

import { motion } from "framer-motion";
import Typewriter from "@/components/Typewriter";

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

/** Easing curve shared across all motion elements */
const easeOut = [0.0, 0.0, 0.2, 1.0];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F9F7F4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 24px 120px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "680px" }}>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          style={{ marginBottom: "56px" }}
        >
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 700,
              color: "#1A1A1A",
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              marginBottom: "20px",
            }}
          >
            Mental Health Matters
          </motion.h1>

          {/* Typewriter starts after heading animation (0.8s delay) */}
          <Typewriter startDelay={800} />
        </section>

        {/* ── Divider ──────────────────────────────────────── */}
        <motion.hr
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: easeOut }}
          style={{
            border: "none",
            borderTop: "1px solid #D4C5B0",
            marginBottom: "64px",
            transformOrigin: "left",
          }}
        />

        {/* ── Quote Cards ──────────────────────────────────── */}
        <section aria-label="Mental health quotes">
          <ol
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "40px",
            }}
          >
            {QUOTES.map((quote, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.1,
                  ease: easeOut,
                }}
                whileHover={{ scale: 1.01 }}
                style={{
                  cursor: "default",
                  transition: "scale 0.2s",
                }}
              >
                <QuoteCard text={quote.text} attribution={quote.attribution} />
              </motion.li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}

/** A single quote card — left-aligned, Lora italic quote, muted Inter attribution */
function QuoteCard({
  text,
  attribution,
}: {
  text: string;
  attribution: string;
}) {
  return (
    <article
      style={{
        borderLeft: "2px solid #D4C5B0",
        paddingLeft: "20px",
      }}
    >
      <blockquote
        style={{
          fontFamily: "var(--font-lora), serif",
          fontStyle: "italic",
          fontSize: "1.1rem",
          lineHeight: 1.7,
          color: "#1A1A1A",
          marginBottom: "10px",
        }}
      >
        &ldquo;{text}&rdquo;
      </blockquote>
      <cite
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontStyle: "normal",
          fontSize: "0.8125rem",
          color: "#6B6B6B",
          letterSpacing: "0.03em",
        }}
      >
        &mdash; {attribution}
      </cite>
    </article>
  );
}
