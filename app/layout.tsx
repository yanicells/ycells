import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ycells",
  description: "a domain. a vibe. a problem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
