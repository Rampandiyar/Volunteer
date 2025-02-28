import React, { useState } from "react";
import axios from "axios";

// API Base URL
const API_BASE_URL = "http://localhost:3000/api";

// Axios instance with auth headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function SendNotification() {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Sent"); // Default to 'sent' status
  const [error, setError] = useState("");

  const handleUserIdChange = (e) => setUserId(e.target.value);
  const handleMessageChange = (e) => setMessage(e.target.value);
  const handleStatusChange = (e) => setStatus(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!userId || !message) {
      setError("User ID and Message are required");
      return;
    }

    try {
      const notificationData = {
        user_id: userId,
        message: message,
        status: status,
      };

      // Send notification data to the backend API
      const response = await api.post("/notifications", notificationData);

      // Reset form fields after successful submission
      setUserId("");
      setMessage("");
      setStatus("sent");
      setError("");
      alert("Notification sent successfully");
    } catch (err) {
      setError("Failed to send notification. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-4 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">
              Send Notification
            </h1>
            <p className="text-indigo-200">Notify volunteers of updates</p>
          </div>
        </header>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
          >
            <div className="mb-6">
              <label
                htmlFor="userId"
                className="block font-semibold text-white"
              >
                User ID (Volunteer)
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={handleUserIdChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mt-2"
                placeholder="Enter Volunteer User ID"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="message"
                className="block font-semibold text-white"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={handleMessageChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mt-2"
                placeholder="Enter notification message"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="status"
                className="block font-semibold text-white"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={handleStatusChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mt-2"
              >
                <option value="Sent">Sent</option>
                <option value="Read">Read</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600 transition-all"
            >
              Send Notification
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SendNotification;
