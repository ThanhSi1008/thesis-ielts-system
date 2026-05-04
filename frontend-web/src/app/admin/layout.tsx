import { Metadata } from "next";
import AdminGuard from "./_components/AdminGuard";
import AdminSidebar from "./_components/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard | TOEIC Master AI",
  description: "Manage learning content for TOEIC Master AI",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-gray-50 dark:bg-gray-950 relative">
        <AdminSidebar />
        <main className="flex-1 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
