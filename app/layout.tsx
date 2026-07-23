import type { Metadata } from "next";
import { Rubik_Dirt, Share_Tech_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const rubikDirt = Rubik_Dirt({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rubik-dirt",
  display: "swap",
});

const shareTech = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TUNG TUNG TUNG SAHUR",
  description:
    "he has a bat. you have WASD. survive the void. a shitpost arena starring tung tung tung sahur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rubikDirt.variable} ${shareTech.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
