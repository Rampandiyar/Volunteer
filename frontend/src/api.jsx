// src/api.jsx
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

// Helper function to set headers with authorization token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// User API
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/add`, userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/login`,
      credentials
    );
    localStorage.setItem("token", response.data.token); // Save token to localStorage
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logoutUser = async (userId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/logout`, {
      userId,
    });
    localStorage.removeItem("token");
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getAllcheckins = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/checkins?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
export const getAllscheckins = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/volunteers/checkins`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching volunteer logs:", error);
    throw error;
  }
};

export const getAllhours = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/hours`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/users/update/${id}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/get/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Event API
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/events`, eventData);
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events`);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// Task API
export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const getAllTasks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Assignment API
export const createAssignment = async (assignmentData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/assignments`,
      assignmentData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

export const updateAssignmentStatus = async (id, statusData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/assignments/${id}`,
      statusData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating assignment status:", error);
    throw error;
  }
};

export const deleteAssignment = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/assignments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw error;
  }
};

export const getAssignmentById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assignments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignment:", error);
    throw error;
  }
};

export const getAssignment = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assignments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignment:", error);
    throw error;
  }
};

export const sendNotification = async (notificationData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/notifications`, // Ensure this matches backend
      notificationData,
      getAuthHeaders() // Include auth headers correctly
    );
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error.response?.data || error);
    throw error;
  }
};

// Notification API
export const getUserNotifications = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/${notificationId}`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/adashboard/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const getTaskCompletionStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/adashboard/tasks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching task completion stats:", error);
    throw error;
  }
};

export const getTopVolunteersByHours = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/adashboard/volunteer-hours`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching top volunteers by hours:", error);
    throw error;
  }
};

export const getTopVolunteerOfMonth = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/adashboard/top-volunteer`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching top volunteer of the month:", error);
    throw error;
  }
};
export const logHours = async (userId, eventId, taskId, hours) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/activitylogs/log-hours`,
      {
        user_id: userId,
        event_id: eventId,
        task_id: taskId,
        hours_logged: hours,
      }
    );

    console.log("Hours logged:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error logging hours:", error);
    throw error;
  }
};

export const getActivityLogs = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/adashboard/activity-logs`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
};

export const getDashboardNotifications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/notifications`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard notifications:", error);
    throw error;
  }
};

export const getVolunteers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/volunteer/volunteers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    throw error;
  }
};

// Task API
export const updateTaskStatus = async (taskId, statusData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/volunteer/tasks/${taskId}`,
      statusData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

// Volunteer Profile API functions
// Get Volunteer Profile by user ID
export const getVolunteerProfile = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/volunteerprofile/profile/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching volunteer profile:", error);
    throw error;
  }
};

// Update Volunteer Profile (skills, interests, availability)
export const updateVolunteerProfile = async (userId, profileData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/volunteerprofile/profile/${userId}`,
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating volunteer profile:", error);
    throw error;
  }
};
export const getAssignedTasks = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/${userId}/assigned-tasks`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    throw error;
  }
};

// Get upcoming events for a specific volunteer
export const getUpcomingEvents = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/${userId}/upcoming-events`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }
};

// Get task statistics for a specific volunteer
export const getTaskStatistics = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/${userId}/task-statistics`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching task statistics:", error);
    throw error;
  }
};
//feedback api
export const createFeedback = async (feedbackData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    console.error("Error creating feedback:", error);
    throw error;
  }
};
export const getFeedbackByVolunteer = async (volunteerId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/feedback/${userId}`, {
      params: { volunteer_id: volunteerId },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return [];
  }
};

export const getFeedbackByAssignment = async (assignment_id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${assignment_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw error;
  }
};
