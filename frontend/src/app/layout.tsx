import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ChamberForge",
  description:
    "Premium-service operating system for HNW/UHNW market",
  manifest: "/manifest.json",
  themeColor: "#fbbf24",
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
      <body className="min-h-screen bg-chamber-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
