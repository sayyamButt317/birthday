import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Caveat, DM_Sans, Fraunces } from "next/font/google";
import { cn } from "@/lib/utils";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK"],
});
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });

export const metadata: Metadata = {
  title: "Happy Birthday, Rafia 💜",
  description: "A little lilac birthday letter for Rafia, from a friend.",
};

export const viewport: Viewport = {
  themeColor: "#efe6fb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("font-sans", sans.variable, serif.variable, hand.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
