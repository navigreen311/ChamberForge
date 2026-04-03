import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ChamberForge",
  description:
    "Premium-service operating system for HNW/UHNW market",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-chamber-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
