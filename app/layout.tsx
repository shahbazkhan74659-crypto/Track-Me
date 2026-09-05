import type { Metadata } from "next";
import { Manrope, Work_Sans } from "next/font/google";
import { colors } from "@/lib/theme";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "Track Me",
  description: "Personal attendance and salary tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${workSans.variable}`}>
      <body
        style={{
          background: colors.pageBackground,
          fontFamily: "var(--font-work-sans), sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
