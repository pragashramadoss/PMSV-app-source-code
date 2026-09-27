import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PMSV Food Safety Updates",
  description: "Food safety regulatory updates from India, the US, EU, UK and Australia, plus India and global news with original sources.",
  other: {
    "codex-preview": "development",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {capable: true, title: "PMSV", statusBarStyle: "default"},
  icons: {
    apple: "/icons/pmsv-family-192.png",
    icon: "/icons/pmsv-family-64.png",
    shortcut: "/icons/pmsv-family-64.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
