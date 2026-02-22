"use client";

import { motion } from "framer-motion";
import QuoteTypewriter from "@/components/QuoteTypewriter";

const ease: [number, number, number, number] = [0.0, 0.0, 0.2, 1.0];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px 80px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {/* Hero title */}
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

        {/* Typewriter quote — types in, pauses, erases, cycles all quotes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <QuoteTypewriter startDelay={1000} />
        </motion.div>
      </div>
    </main>
  );
}
