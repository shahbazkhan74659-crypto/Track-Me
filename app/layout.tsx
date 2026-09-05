import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Me",
  description: "Personal attendance tracker — backend complete; no frontend yet (see Phase 9 onward).",
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
