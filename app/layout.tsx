import type { Metadata } from "next";
import { Oswald, Playfair_Display } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "JustDesignFX Agency | Future of Digital Design",
  description: "We craft premium digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
