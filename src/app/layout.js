import {
  DM_Mono,
  DM_Sans,
  Geist,
  Geist_Mono,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "Cafe Museo | Cafe, Coffee & Catering in Dasmariñas, Cavite",
  description: "Welcome to Cafe Museo DLSU-D. Enjoy comforting Filipino food, specialty coffee, and premium catering services. Book your catering packages or cafe tables online!",
  keywords: ["Cafe Museo", "Cafe Museo DLSU-D", "Catering Dasmarinas", "Coffee Shop Cavite", "Cafe Museo Reservation"],
  metadataBase: new URL('https://cafemuseo.ph'),
  openGraph: {
    title: "Cafe Museo | Cafe, Coffee & Catering",
    description: "Welcome to Cafe Museo DLSU-D. Enjoy comforting Filipino food, specialty coffee, and premium catering services. Submit your reservation request online!",
    url: "https://cafemuseo.ph",
    siteName: "Cafe Museo",
    images: [
      {
        url: "/cafemuseo_logo.jpg",
        width: 800,
        height: 800,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${playfairDisplay.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
