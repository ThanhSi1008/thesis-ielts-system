export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">TOEIC Master AI - Admin Dashboard</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

