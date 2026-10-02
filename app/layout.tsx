import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const viewport: Viewport = { themeColor: "#171417" };

export const metadata: Metadata = {
  metadataBase: new URL("https://ycells.com"),
  title: "ycells",
  description: "Explore SimplifyTrabaho, UniSort, and airosu.",
  verification: {
    google: "eVLb2lTbuAz4-4MAUUSPkp9ZQe0rHc00MWOyB2LQccg",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={hankenGrotesk.variable}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
