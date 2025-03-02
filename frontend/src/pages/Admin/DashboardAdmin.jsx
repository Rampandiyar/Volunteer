import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import {
  getDashboardStats,
  getTaskCompletionStats,
  getTopVolunteersByHours,
  getTopVolunteerOfMonth,
  getActivityLogs,
} from "../../api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalTasks: 0,
    upcomingEvents: 0,
    volunteerHours: 0,
  });
  const [taskCompletionData, setTaskCompletionData] = useState([
    { name: "Completed", value: 0 },
    { name: "Remaining", value: 0 },
  ]);
  const [volunteerHoursData, setVolunteerHoursData] = useState([]);
  const [topVolunteer, setTopVolunteer] = useState({
    name: "Volunteer",
    hours: 5,
  });
  const [recentActivityLogs, setRecentActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#4CAF50", "#FF7043"];
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const statsResponse = await getDashboardStats();
        setStats(statsResponse);

        // Fetch task completion stats
        const taskCompletionResponse = await getTaskCompletionStats();
        setTaskCompletionData([
          { name: "Completed", value: taskCompletionResponse.completed },
          {
            name: "Remaining",
            value:
              taskCompletionResponse.total - taskCompletionResponse.completed,
          },
        ]);

        // Fetch top volunteer of the month
        const topVolunteerResponse = await getTopVolunteerOfMonth();
        setTopVolunteer(topVolunteerResponse);

        // Fetch recent activity logs
        const activityLogsResponse = await getActivityLogs();
        const formattedActivityLogs = activityLogsResponse.map((log) => ({
          id: log.log_id, // Use `log_id` as the unique identifier
          date: log.log_date, // Use `log_date` for the date
          activity: `User ${log.user_id} logged ${log.hours_logged} hours for Task ${log.task_id}`, // Create a meaningful activity description
        }));
        setRecentActivityLogs(formattedActivityLogs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate and Download PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.text("Volunteer Report", 20, 10);
    doc.text(`Total Volunteers: ${stats.totalVolunteers}`, 20, 20);
    doc.text(`Total Tasks: ${stats.totalTasks}`, 20, 30);
    doc.text(`Upcoming Events: ${stats.upcomingEvents}`, 20, 40);
    doc.text(`Top Volunteer: ${topVolunteer.name}`, 20, 50);
    doc.text(`Total Volunteer Hours: ${stats.volunteerHours}`, 20, 60);
    doc.save("Volunteer_Report.pdf");
  };

  // Generate and Download Excel Report
  const generateExcelReport = () => {
    const ws = XLSX.utils.json_to_sheet(volunteerHoursData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Volunteer Hours");
    XLSX.writeFile(wb, "Volunteer_Report.xlsx");
  };

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-4 md:p-8 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-indigo-200">
                Overview of Volunteer Management
              </p>
            </div>
          </header>

          {/* Quick Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white">
                Total Volunteers
              </h2>
              <p className="text-3xl font-bold">{stats.totalVolunteers}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white">Total Tasks</h2>
              <p className="text-3xl font-bold">{stats.totalTasks}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white">
                Upcoming Events
              </h2>
              <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Task Completion Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Task Completion Rates
              </h2>
              <PieChart width={300} height={200}>
                <Pie
                  data={taskCompletionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {taskCompletionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            {/* Volunteer Hours Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Task completeion Bar graph
              </h2>
              <BarChart
                width={400}
                height={300}
                data={taskCompletionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
                  <Cell fill="#4CAF50" /> {/* Green for Completed */}
                  <Cell fill="#FF7043" /> {/* Orange for Remaining */}
                </Bar>
              </BarChart>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4 mb-10">
            <button
              onClick={generatePDFReport}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200"
            >
              Download PDF Report
            </button>
            <button
              onClick={generateExcelReport}
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition duration-200"
            >
              Download Excel Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
