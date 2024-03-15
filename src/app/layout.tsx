import "./globals.css";
import localFont from "next/font/local";
import { Overpass } from "next/font/google";
import { useState } from "react";

export const metadata = {
  title: "Next.js",
  description: "Generated by Next.js",
};

const fabulist_extended = localFont({
  src: [
    {
      path: "./fonts/FabulistExtended700.woff2",
      weight: "700",
    },
    {
      path: "./fonts/FabulistExtended500.woff2",
      weight: "500",
    },
    {
      path: "./fonts/FabulistExtended300.woff2",
      weight: "300",
    },
  ],
  display: "swap",
  variable: "--fabulistextended",
});

const overpass = Overpass({
  subsets: ["latin"],
  display: "swap",
  variable: "--overpass",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${fabulist_extended.variable} ${overpass.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
