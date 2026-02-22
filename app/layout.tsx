import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>"
        />
      </head>
      <body
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          backgroundColor: "#F9F7F4",
          color: "#1A1A1A",
        }}
      >
        {children}
      </body>
    </html>
  );
}
