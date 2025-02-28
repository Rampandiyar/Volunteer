import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  getAssignedTasks,
  getUpcomingEvents,
  getTaskStatistics,
  getDashboardNotifications,
} from "../../api"; // Import the API functions

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalHoursLogged: 0,
  });

  const userId = 1; // Replace with the actual logged-in user ID

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
    }
    // Fetch notifications
    const notificationsResponse = await getDashboardNotifications();
    setNotifications(notificationsResponse);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // Calculate total hours logged for all tasks
  const totalHoursLogged = tasks.reduce(
    (acc, task) => acc + task.hoursLogged,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-4 md:p-8 text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text p-1 bg-gradient-to-r from-white via-gray-100 to-gray-200">
          Volunteer Dashboard
        </h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks Overview */}
        <div className="lg:col-span-2 space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-3xl font-bold text-white mb-8">Assigned Tasks</h2>
          <div className="space-y-4">
            {tasks
              .filter((task) => task.status === "assigned")
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-white/20 backdrop-blur-lg hover:bg-white/30 transition rounded-xl p-4 cursor-pointer"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white">{task.name}</h3>
                      <p className="text-sm text-indigo-200">
                        {task.description}
                      </p>
                    </div>
                    <div className="text-sm text-gray-200">
                      Skills: {task.skillsRequired}
                    </div>
                  </div>
                </div>
              ))}
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
        <div className="space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-3xl font-bold text-white mb-8">
            Upcoming Events
          </h2>
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-2xl text-white">
                      {event.title}
                    </h3>
                    <p className="text-lg text-indigo-200">
                      {event.description}
                    </p>
                    <p className="text-sm text-indigo-400 mt-2">
                      Date: {event.date}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-200 mb-2">
                      Available Tasks
                    </h4>
                    {event.availableTasks.map((task) => (
                      <button
                        key={task.id}
                        className="block w-full bg-indigo-500 text-white px-4 py-2 rounded-lg text-base hover:bg-indigo-600 transition"
                        onClick={() =>
                          handleApplyForEventTask(event.id, task.name)
                        }
                      >
                        {task.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`mb-4 p-4 rounded-xl ${
                notification.type === "info"
                  ? "bg-blue-600/20"
                  : notification.type === "warning"
                  ? "bg-yellow-600/20"
                  : "bg-red-600/20"
              }`}
            >
              <p>{notification.message}</p>
            </li>
          ))}
        </ul>
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
