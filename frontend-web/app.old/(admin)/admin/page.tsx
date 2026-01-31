export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Manage Exams</h3>
          <p className="text-gray-600 mb-4">Create and edit TOEIC exams</p>
          <button className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">
            Manage Exams
          </button>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
          <p className="text-gray-600 mb-4">View and manage user accounts</p>
          <button className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">
            Manage Users
          </button>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Analytics</h3>
          <p className="text-gray-600 mb-4">View system statistics and reports</p>
          <button className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

