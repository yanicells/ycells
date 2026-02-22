import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";

/**
 * Source Serif 4 — closest Google Fonts match to Medium's Charter.
 * Clean, editorial serif with excellent readability.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["300", "400", "600", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mental Health Matters",
  description:
    "A quiet space for mental health reminders, gentle quotes, and a little kindness.",
  verification: {
    google: "eVLb2lTbuAz4-4MAUUSPkp9ZQe0rHc00MWOyB2LQccg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>"
        />
      </head>
      <body
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
