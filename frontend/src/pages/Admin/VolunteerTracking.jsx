import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

function VolunteerTracking() {
  const [logs] = useState([]);

  const [filter, setFilter] = useState("All");

  const filteredLogs = logs.filter(
    (log) =>
      filter === "All" || log.status === filter || log.category === filter
  );

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);

  const taskStatuses = [
    {
      name: "Completed",
      value: logs.filter((log) => log.status === "Completed").length,
    },
    {
      name: "In Progress",
      value: logs.filter((log) => log.status === "In Progress").length,
    },
  ];

  const COLORS = ["#4CAF50", "#FFC107"];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-8">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute animate-[blob_15s_infinite] top-10 right-20 w-72 h-72 bg-yellow-400 rounded-full mix-blend-overlay filter blur-2xl"></div>
        <div className="absolute animate-[blob_15s_infinite] delay-2000 bottom-10 left-20 w-64 h-64 bg-cyan-400 rounded-full mix-blend-overlay filter blur-2xl"></div>
        <div className="absolute animate-[blob_15s_infinite] delay-4000 top-1/3 left-1/2 w-80 h-80 bg-green-400 rounded-full mix-blend-overlay filter blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-left w-full max-w-7xl mx-auto py-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text p-1 bg-gradient-to-r from-pink-400 via-red-500 to-yellow-600 mb-12 text-center drop-shadow-lg">
          Activity Log Dashboard
        </h1>

        {/* Filters */}
        <div className="mb-6 flex justify-center">
          <select
            className="p-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Event Management">Event Management</option>
            <option value="Technical">Technical</option>
            <option value="Logistics">Logistics</option>
          </select>
        </div>

        {/* Summary */}
        <div className="max-w-full overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
              <h2 className="text-xl font-semibold text-indigo-700">
                Total Hours Logged
              </h2>
              <p className="text-2xl font-bold text-indigo-900">{totalHours}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
              <h2 className="text-xl font-semibold text-indigo-700">
                Task Status Distribution
              </h2>
              <PieChart width={300} height={200}>
                <Pie
                  data={taskStatuses}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {taskStatuses.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        </div>

        {/* Hours Logged Over Time (Moved and enlarged) */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
          <h2 className="text-xl font-semibold text-indigo-700">
            Hours Logged Over Time
          </h2>
          <BarChart
            width={900} // Increased width
            height={500} // Increased height
            data={logs}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" fill="#4CAF50" />
          </BarChart>
        </div>

        {/* Activity Log */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Detailed Logs
          </h2>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Task</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">
                  Hours Logged
                </th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Category</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {log.task}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.status}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.hours}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.date}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VolunteerTracking;
