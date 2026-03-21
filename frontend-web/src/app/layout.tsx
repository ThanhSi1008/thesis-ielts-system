import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "IELTS Master English - Ace IELTS",
  description: "Master your English, ace your IELTS",
  icons: {
    icon: "https://res.cloudinary.com/dalaaegob/image/upload/v1772890493/3dc47c11-e5d6-4f59-b882-4b090db540a9.png"
  }
};

import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ScrollToTop />
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
