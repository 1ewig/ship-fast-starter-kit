import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans, Herr_Von_Muellerhoff } from "next/font/google";
import { cn } from "@/lib/utils";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});
const herrVonMuellerhoff = Herr_Von_Muellerhoff({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: "SaaS Starter Kit",
  description: "A modern SaaS starter kit built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", plusJakartaSans.variable, herrVonMuellerhoff.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
