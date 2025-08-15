import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Inter } from "next/font/google";
import ClientLayout from "@/components/client-layout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EthioAddis - Real Estate Excellence",
  description:
    "Buy, Sell, or Rent properties with Ethiopia's premier real estate company",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${inter.className}`}
      >
        <AuthProvider>
          <ClientLayout>
            <Toaster richColors position="top-center" />
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
