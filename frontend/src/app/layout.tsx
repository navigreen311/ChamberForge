import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const viewport: Viewport = {
  themeColor: "#fbbf24",
};

export const metadata: Metadata = {
  title: "ChamberForge",
  description: "Premium-service operating system for HNW/UHNW market",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ChamberForge",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    title: "ChamberForge",
    description: "Premium-service operating system for HNW/UHNW market",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0D1117] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
