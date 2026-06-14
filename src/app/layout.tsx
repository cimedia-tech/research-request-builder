import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CIMedia Research Intelligence Agency",
  description:
    "Transform rough research questions into precision-engineered research briefs. Powered by the 32-agent CIMedia Research Machine.",
  keywords: [
    "research",
    "CIMedia",
    "AI research",
    "research brief",
    "intelligence agency",
  ],
  openGraph: {
    title: "CIMedia Research Intelligence Agency",
    description:
      "Map your research terrain. Our 32-agent research team will chart the path.",
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
