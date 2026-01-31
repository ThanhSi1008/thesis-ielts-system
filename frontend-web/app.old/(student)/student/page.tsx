export default function StudentDashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Student Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Take Exam</h3>
          <p className="text-gray-600 mb-4">Start a new TOEIC practice test</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Start Exam
          </button>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">My Results</h3>
          <p className="text-gray-600 mb-4">View your exam history and scores</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View Results
          </button>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Learning Materials</h3>
          <p className="text-gray-600 mb-4">Access study resources and lessons</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Browse Materials
          </button>
        </div>
      </div>
    </div>
  )
}

