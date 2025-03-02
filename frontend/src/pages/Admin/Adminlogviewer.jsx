import { useState, useEffect } from "react";
import { getAllscheckins, getAllhours } from "../../api"; // Import API functions

function AdminVolunteerLogViewer() {
  const [logs, setLogs] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [filter, setFilter] = useState({
    date: "",
    volunteer: "",
  });

  // Fetch check-ins from the backend
  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        const data = await getAllscheckins(); // Use the API function
        setLogs(data);
      } catch (error) {
        console.error("Error fetching check-ins:", error);
      }
    };

    fetchCheckIns();
  }, []);
  //fetch total hours from backend
  useEffect(() => {
    const fetchTotalHours = async () => {
      try {
        const data = await getAllhours(); // Fetch data
        setTotalHours(data.length > 0 ? data[0].total_hours || 0 : 0); // Extract total_hours safely
      } catch (error) {
        console.error("Error fetching total hours:", error);
      }
    };

    fetchTotalHours();
  }, []);

  // Filter logs based on input fields
  const filteredLogs = logs.filter((log) => {
    return (
      (filter.date
        ? new Date(log.checkin_time).toLocaleDateString().includes(filter.date)
        : true) && // Fixed: format date consistently for filtering
      (filter.volunteer
        ? log.user_id
            .toString()
            .toLowerCase()
            .includes(filter.volunteer.toLowerCase())
        : true) // Fixed: explicitly convert to lowercase
    );
  });

  // Helper function to format hours
  const calculateHours = (checkinTime, checkoutTime) => {
    if (!checkoutTime) return "Still checked in";

    const hours =
      (new Date(checkoutTime) - new Date(checkinTime)) / (1000 * 60 * 60);
    return hours.toFixed(2); // Fixed: format hours with 2 decimal places
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-4 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">
              Volunteer Activity Logs
            </h1>
            <p className="text-indigo-200">
              Track volunteer hours and activities
            </p>
          </div>
        </header>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          {/* Filter Inputs */}
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-4">
            <input
              type="date"
              value={filter.date}
              onChange={(e) => setFilter({ ...filter, date: e.target.value })}
              className="border px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Filter by date"
            />
            <input
              type="text"
              value={filter.volunteer}
              onChange={(e) =>
                setFilter({ ...filter, volunteer: e.target.value })
              }
              className="border px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Filter by volunteer"
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 overflow-x-auto">
          {" "}
          {/* Fixed: added overflow-x-auto for mobile responsiveness */}
          {/* Logs Table */}
          <table className="table-auto w-full border-collapse border text-white">
            <thead>
              <tr>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Volunteer</th>
                <th className="border px-4 py-2">Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/10 transition-all">
                    <td className="border px-4 py-2">
                      {new Date(log.checkin_time).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2">{log.user_id}</td>
                    <td className="border px-4 py-2">
                      {calculateHours(log.checkin_time, log.checkout_time)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center border px-4 py-2">
                    No matching logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Report */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Report</h2>
          <p className="text-lg">
            Total Hours Logged: {Number(totalHours).toFixed(2)}
          </p>{" "}
          {/* Fixed: format with 2 decimal places */}
        </div>
      </div>
    </div>
  );
}

export default AdminVolunteerLogViewer;
