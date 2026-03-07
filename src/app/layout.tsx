import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mothership Companion | Warden",
  description: "Voice-interactive companion for Mothership RPG Warden scenarios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
