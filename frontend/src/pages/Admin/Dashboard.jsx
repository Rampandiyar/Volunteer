import { useEffect, useState } from "react";
import { X, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { jsPDF } from "jspdf";
import {
  getAssignedTasks,
  getUpcomingEvents,
  getTaskStatistics,
  getUserNotifications,
  markNotificationAsRead,
} from "../../api"; // Import the API functions

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [error, setError] = useState("");
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalHoursLogged: 0,
  });
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);

  // Get user ID from local storage when component mounts
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    } else {
      setError("User ID not found. Please log in again.");
      console.error("User ID not found in local storage");
    }
  }, []);

  // Fetch data from the backend only when userId is available
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Fetch data from the backend
  const fetchData = async () => {
    try {
      // Fetch assigned tasks
      const assignedTasks = await getAssignedTasks(userId);
      setTasks(assignedTasks);

      // Fetch upcoming events
      const upcomingEvents = await getUpcomingEvents(userId);
      setEvents(upcomingEvents);

      // Fetch task statistics
      const statistics = await getTaskStatistics(userId);
      setTaskStats(statistics);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data. Please try again later.");
    }
  };

  // Separate useEffect for notifications
  useEffect(() => {
    if (!userId) return; // Don't fetch if no userId

    const fetchNotifications = async () => {
      try {
        const data = await getUserNotifications(userId);
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Error fetching notifications");
      }
    };

    fetchNotifications();

    // Set up periodic refresh of notifications (every 30 seconds)
    const intervalId = setInterval(fetchNotifications, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [userId]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation(); // Prevent notification expansion when clicking the button
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, status: "Read" } : n
        )
      );
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
  };

  // Format relative time for notifications
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const pastDate = new Date(dateString);
    const diff = now - pastDate;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return pastDate.toLocaleDateString();
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleAcceptTask = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === selectedTask.id ? { ...task, status: "pending" } : task
      )
    );
    setSelectedTask(null);
  };

  const handleRejectTask = () => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== selectedTask.id)
    );
    setSelectedTask(null);
  };

  const handleApplyForEventTask = (eventId, taskName) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      {
        id: tasks.length + 1,
        name: taskName,
        description: `Task for event ID ${eventId}: ${taskName}`,
        skillsRequired: "General",
        completed: false,
        status: "assigned",
        hoursLogged: 0,
      },
    ]);
  };

  // Generate certificate
  const generateCertificate = () => {
    if (!userName) {
      alert("Please enter your name before generating the certificate.");
      return;
    }

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Certificate of Completion", 105, 40, { align: "center" });

    doc.setFontSize(16);
    doc.text(`This is to certify that`, 105, 60, { align: "center" });
    doc.setFontSize(18);
    doc.text(userName, 105, 75, { align: "center" });
    doc.setFontSize(16);
    doc.text("has successfully completed the assigned tasks.", 105, 90, {
      align: "center",
    });

    doc.save("certificate.pdf");
  };

  // Get unread notification count
  const unreadNotificationsCount = notifications.filter(
    (notification) => notification.status !== "Read"
  ).length;

  // Show error message if no user ID found
  if (error && !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-4 md:p-8 flex items-center justify-center text-white">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => (window.location.href = "/login")}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-4 md:p-8 text-white">
      {/* Header with Notification Bell */}
      <div className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text p-1 bg-gradient-to-r from-white via-gray-100 to-gray-200">
          Volunteer Dashboard
        </h1>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 relative"
            onClick={toggleNotificationDropdown}
          >
            <Bell size={24} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-medium">Notifications</h3>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadNotificationsCount} unread
                  </span>
                )}
              </div>

              {notifications.length > 0 ? (
                <div>
                  {notifications
                    .slice(0, showAllNotifications ? notifications.length : 3)
                    .map((notification) => (
                      <div
                        key={notification.notification_id}
                        className={`p-3 border-b border-gray-700 ${
                          notification.status === "Read" ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">
                            {notification.message.length > 60
                              ? `${notification.message.substring(0, 60)}...`
                              : notification.message}
                          </p>
                          {notification.status !== "Read" && (
                            <button
                              onClick={(e) =>
                                handleMarkAsRead(
                                  notification.notification_id,
                                  e
                                )
                              }
                              className="text-xs bg-blue-500 px-2 py-1 rounded hover:bg-blue-600 ml-2 whitespace-nowrap"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {getRelativeTime(notification.sent_at)}
                        </p>
                      </div>
                    ))}

                  {notifications.length > 3 && (
                    <button
                      className="w-full p-2 text-blue-400 text-sm flex items-center justify-center hover:bg-gray-700"
                      onClick={() =>
                        setShowAllNotifications(!showAllNotifications)
                      }
                    >
                      {showAllNotifications ? (
                        <>
                          Show Less <ChevronUp size={16} className="ml-1" />
                        </>
                      ) : (
                        <>
                          Show All ({notifications.length}){" "}
                          <ChevronDown size={16} className="ml-1" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <p className="p-4 text-sm text-gray-400">No notifications</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks Overview */}
        <div className="lg:col-span-2 space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-3xl font-bold text-white mb-8">Assigned Tasks</h2>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              <ul className="space-y-4">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="bg-white/20 p-4 rounded-xl cursor-pointer hover:bg-white/30"
                    onClick={() => handleTaskClick(task)}
                  >
                    <p className="text-sm text-gray-400">Task ID: {task.id}</p>
                    <h3 className="font-semibold text-white">{task.name}</h3>
                    <p className="text-sm text-indigo-200">
                      {task.description}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-200">No assigned tasks.</p>
            )}
          </div>
        </div>

        {/* Task Statistics */}
        <div className="space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Task Statistics
          </h3>
          <div className="space-y-6">
            <div className="bg-blue-600/20 p-4 rounded-lg">
              <h4 className="text-sm text-blue-200">Total Tasks</h4>
              <p className="text-3xl font-bold text-white">
                {taskStats.totalTasks}
              </p>
            </div>
            <div className="bg-green-600/20 p-4 rounded-lg">
              <h4 className="text-sm text-green-200">Completed Tasks</h4>
              <p className="text-3xl font-bold text-white">
                {taskStats.completedTasks}
              </p>
            </div>
            <div className="bg-purple-600/20 p-4 rounded-lg">
              <h4 className="text-sm text-purple-200">Total Hours Logged</h4>
              <p className="text-3xl font-bold text-white">
                {taskStats.totalHoursLogged} hrs
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Upcoming Events
          </h2>
          {events.length > 0 ? (
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="bg-white/20 p-4 rounded-md">
                  <p className="text-sm text-gray-400">Event ID: {event.id}</p>
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-sm">{event.description}</p>
                  <p className="text-sm text-gray-300">📅 {event.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-200">No upcoming events.</p>
          )}
        </div>
      </div>

      {/* Certificate Generation Section */}
      <div className="mt-10 p-6 bg-white/10 backdrop-blur-lg rounded-2xl text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          Generate Certificate
        </h2>
        <input
          type="text"
          placeholder="Enter your name"
          className="p-2 rounded-md text-black w-64 mb-4"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <br />
        <button
          onClick={generateCertificate}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Download Certificate
        </button>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white/20 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-white/70 hover:text-white"
              onClick={() => setSelectedTask(null)}
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-4">Task Details</h2>
            <div className="space-y-3">
              <p>
                <strong>Name:</strong> {selectedTask.name}
              </p>
              <p>
                <strong>Description:</strong> {selectedTask.description}
              </p>
              <p>
                <strong>Skills Required:</strong> {selectedTask.skillsRequired}
              </p>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                onClick={handleAcceptTask}
              >
                Accept
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                onClick={handleRejectTask}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
