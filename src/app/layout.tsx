import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tailorstouch",
    template: "%s · Tailorstouch",
  },
  description:
    "Tailorstouch. Shop new arrivals, bestsellers, and the latest collection.",
  openGraph: {
    type: "website",
    siteName: "Tailorstouch",
    title: "Tailorstouch",
    description: "Tailorstouch. Shop the latest collection.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tailorstouch",
    description: "Tailorstouch. Shop the latest collection.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
