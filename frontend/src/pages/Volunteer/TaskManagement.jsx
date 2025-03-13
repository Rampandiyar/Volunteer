import { useState, useEffect } from "react";
import { MoreVertical, X, Filter, ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserAssignments, updateTask } from "../../api"; // Updated import

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [newTaskNote, setNewTaskNote] = useState("");
  const [userId, setUserId] = useState(null);

  // Fetch user ID from localStorage or session on component mount
  useEffect(() => {
    const fetchUserId = () => {
      try {
        // Try to get userId from localStorage
        const storedUserId = localStorage.getItem("userId");

        // If userId exists in localStorage, use it
        if (storedUserId) {
          setUserId(storedUserId);
          return;
        }

        // Fallback - for development you can set a default userId
        // In production, you might want to redirect to login
        setUserId("1");
      } catch (error) {
        console.error("Error fetching user ID:", error);
        setUserId("1"); // Fallback
      }
    };

    fetchUserId();
  }, []);

  // Fetch tasks assigned to current user when userId is available
  useEffect(() => {
    if (!userId) return; // Don't fetch if userId is not available yet

    const fetchUserTasks = async () => {
      try {
        setLoading(true);
        const taskData = await getUserAssignments(userId);
        // Transform backend data to match frontend structure
        const transformedTasks = taskData.map((task) => ({
          id: task.task_id,
          assignmentId: task.assignment_id,
          name: task.task_name,
          description: task.description || "No description provided",
          status: task.task_status || "Pending",
          priority: determinePriority(task.required_skills),
          dueDate: formatDate(task.assigned_at),
          assignedTo: "You",
          eventId: task.event_id,
          requiredSkills: task.required_skills || "",
          notes: task.notes || [],
        }));
        setTasks(transformedTasks);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user tasks:", err);
        setError(
          err.message ||
            "Failed to load your assigned tasks. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserTasks();
  }, [userId]);

  // Helper function to determine priority based on required skills
  const determinePriority = (skills) => {
    if (!skills) return "Low";
    const skillsArray = skills.split(",");
    if (skillsArray.length > 3) return "High";
    if (skillsArray.length > 1) return "Medium";
    return "Low";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split("T")[0];
    return new Date(dateString).toISOString().split("T")[0];
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (filter === "All" || task.status === filter) &&
      task.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    Pending: "bg-red-100 text-red-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    Completed: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    High: "border-red-500",
    Medium: "border-yellow-500",
    Low: "border-green-500",
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      // Prepare the data for backend
      const backendTask = {
        task_name: updatedTask.name,
        description: updatedTask.description,
        required_skills: updatedTask.requiredSkills,
        status: updatedTask.status,
      };

      // Call the backend API
      await updateTask(updatedTask.id, backendTask);

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );

      setNewTaskNote("");
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-4 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">
              My Assigned Tasks
            </h1>
            <p className="text-indigo-200">
              View and manage tasks assigned to you
            </p>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-lg rounded-xl p-4 mb-6 text-white">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Task List */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            {/* Filter Section */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                {["All", "Pending", "In Progress", "Completed"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2 rounded-full text-sm transition ${
                        filter === status
                          ? "bg-blue-600 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="px-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="flex items-center text-white/70 hover:text-white">
                  <Filter className="mr-2" size={18} /> Filter
                </button>
              </div>
            </div>

            {/* Task List */}
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-indigo-200">
                  Loading your assigned tasks...
                </p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-indigo-200">
                  No assigned tasks found. Try adjusting your filters or check
                  back later.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border-l-4 ${
                      priorityColors[task.priority]
                    } cursor-pointer hover:bg-white/20 transition-all`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-white">
                          {task.name}
                        </h3>
                        <p className="text-sm text-indigo-200 truncate">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            statusColors[task.status]
                          }`}
                        >
                          {task.status}
                        </span>
                        <MoreVertical />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Task Statistics */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <ListChecks className="mr-2" /> Your Task Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-600/20 p-4 rounded-xl text-center">
                  <h4 className="text-sm text-blue-200">Assigned Tasks</h4>
                  <p className="text-4xl font-bold text-white">
                    {tasks.length}
                  </p>
                </div>
                <div className="bg-green-600/20 p-4 rounded-xl text-center">
                  <h4 className="text-sm text-green-200">Completed</h4>
                  <p className="text-4xl font-bold text-white">
                    {tasks.filter((t) => t.status === "Completed").length}
                  </p>
                </div>
                <div className="bg-yellow-600/20 p-4 rounded-xl text-center">
                  <h4 className="text-sm text-yellow-200">In Progress</h4>
                  <p className="text-4xl font-bold text-white">
                    {tasks.filter((t) => t.status === "In Progress").length}
                  </p>
                </div>
                <div className="bg-red-600/20 p-4 rounded-xl text-center">
                  <h4 className="text-sm text-red-200">Pending</h4>
                  <p className="text-4xl font-bold text-white">
                    {tasks.filter((t) => t.status === "Pending").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white shadow-2xl rounded-2xl p-6 max-w-lg w-full backdrop-blur-lg text-gray-900 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-900">
                  Task Details
                </h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-600 hover:text-gray-500 transition"
                >
                  <X />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-xl text-gray-900">
                    {selectedTask.name}
                  </h3>
                  <p className="text-gray-600">{selectedTask.description}</p>
                  <div className="mt-3 text-sm text-gray-500">
                    Assignment ID: {selectedTask.assignmentId}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Priority
                    </label>
                    <select
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
                      value={selectedTask.priority}
                      onChange={(e) =>
                        setSelectedTask({
                          ...selectedTask,
                          priority: e.target.value,
                        })
                      }
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Status
                    </label>
                    <select
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500"
                      value={selectedTask.status}
                      onChange={(e) =>
                        setSelectedTask({
                          ...selectedTask,
                          status: e.target.value,
                        })
                      }
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-200 border border-gray-300 rounded-lg p-3 text-gray-700 cursor-not-allowed"
                    value={selectedTask.dueDate}
                    disabled
                  />
                </div>
              </div>

              <button
                onClick={() => handleUpdateTask(selectedTask)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-3 transition text-white font-semibold"
              >
                Update Task
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TaskManagement;
