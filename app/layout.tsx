import type { Metadata } from "next";
import { Geist, Geist_Mono, Akaya_Telivigala } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const akayaTelivigala = Akaya_Telivigala({
  weight: "400",
  variable: "--font-akaya",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ulala Wishlist Manager",
  description: "Save your wishlist and track your purchases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${akayaTelivigala.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
