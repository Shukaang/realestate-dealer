import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";
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
  title: "Real Estate Dealer",
  description: "Buy, Sell, or Rent with ease",
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
