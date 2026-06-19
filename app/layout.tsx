import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InfoSetu | Science, Tech & AI in Bengali",
  description: "Modern Bengali knowledge blog for science, technology, AI, coding, and future learning.",
  metadataBase: new URL("https://infosetu.example"),
  openGraph: {
    title: "InfoSetu",
    description: "Science, Tech & AI in Bengali",
    type: "website",
  },
  icons: {
    icon: "/logo1.png",
  },
};

import Header from "@/components/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
