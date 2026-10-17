import type { Metadata } from "next";
import { Suspense } from "react";
import { DynaPuff, Bricolage_Grotesque, VT323 } from "next/font/google";
import "./globals.css";
import "@/lib/env";
import { AudioProvider } from "@/components/deck/AudioProvider";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { ToastContainer } from "@/components/ui/Toast";

const dynaPuff = DynaPuff({
  subsets: ["latin"],
  variable: "--font-dynapuff",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chill Guy — Sunny Rooftop Cassette Player",
  description: "Play music from your own device with slow, drifting scenes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dynaPuff.variable} ${bricolage.variable} ${vt323.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-primary selection:bg-secondary selection:text-primary">
        <Suspense fallback={null}>
          <AudioProvider>
            <GrainOverlay />
            <ToastContainer />
            {children}
          </AudioProvider>
        </Suspense>
      </body>
    </html>
  );
}
