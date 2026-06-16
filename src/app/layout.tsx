import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Research Machine™ | Vantage Intelligence Group",
  description:
    "Transform rough questions into decision-ready research briefs. Powered by Vantage Intelligence Group.",
  keywords: [
    "research",
    "Vantage Intelligence Group",
    "The Research Machine",
    "AI research",
    "research brief",
    "decision support",
  ],
  openGraph: {
    title: "The Research Machine™",
    description:
      "Map your research terrain. Powered by Vantage Intelligence Group.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
