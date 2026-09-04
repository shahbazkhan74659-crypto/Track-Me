import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Me — Backend Test Page",
  description: "Temporary harness for exercising Track Me's backend engines (Phase 2).",
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
