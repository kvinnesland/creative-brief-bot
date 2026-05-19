import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Brief Agent",
  description: "AI-driven creative brief assistant",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
