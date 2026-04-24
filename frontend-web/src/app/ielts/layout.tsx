"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { IeltsSidebar, IeltsSidebarOverlay } from "./_components/IeltsSidebar";
import { useIeltsSidebar } from "@/contexts/IeltsSidebarContext";

export default function IeltsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode } = useIeltsSidebar();
  const pathname = usePathname();
  const isOnboarding = pathname === "/ielts/basic/onboarding";

  useEffect(() => {
    // Enable scrolling on the main body (it was previously hidden)
    document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="h-[calc(100vh-56px)] bg-white font-sans overflow-hidden">
      {/* Overlay drawer — always mounted (visibility controlled internally) */}
      <IeltsSidebarOverlay />

      <div className="flex h-full">
        {/* Inline sidebar (expanded or mini) */}
        {!isOnboarding && <IeltsSidebar />}

        {/* Main content area — with its own scrollbar */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto transition-all duration-300 ease-in-out">
          <div className="w-full min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
