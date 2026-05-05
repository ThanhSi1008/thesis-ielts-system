import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { GradingProvider } from "@/contexts/GradingContext";
import { IeltsSidebarProvider } from "@/contexts/IeltsSidebarContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "IELTS Master English - Ace IELTS",
  description: "Master your English, ace your IELTS",
  icons: {
    icon: "https://res.cloudinary.com/dalaaegob/image/upload/v1772890493/3dc47c11-e5d6-4f59-b882-4b090db540a9.png"
  }
};

import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/Toaster";
import { GlobalVocabFab } from "@/components/GlobalVocabFab";
import { GlobalAIChatFab } from "@/components/GlobalAIChatFab";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Inline script runs before React hydrates — prevents flash of wrong theme
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Flash-prevention: sets dark class synchronously before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <NotificationProvider>
                <GradingProvider>
                  <IeltsSidebarProvider>
                    <ScrollToTop />
                    <Navbar />
                    <Toaster />
                    <GlobalVocabFab />
                    <GlobalAIChatFab />
                    {children}
                  </IeltsSidebarProvider>
                </GradingProvider>
              </NotificationProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
