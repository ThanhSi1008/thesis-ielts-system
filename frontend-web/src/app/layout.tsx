import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOEIC Master AI",
  description: "Master your English, ace your TOEIC",
  icons: {
    icon: "https://res.cloudinary.com/dalaaegob/image/upload/v1772890493/3dc47c11-e5d6-4f59-b882-4b090db540a9.png"
  }
};

import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
