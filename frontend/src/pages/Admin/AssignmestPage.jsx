import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { createFeedback } from "../../api";

// API Base URL
const API_BASE_URL = "http://localhost:3000/api";

// Axios instance with auth headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
});

// Fetch all assignments
const getAllAssignments = async () => {
  try {
    const response = await api.get("/assignments");
    return response.data;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
};

// Create a new assignment
const createAssignment = async (assignmentData) => {
  try {
    // Explicitly format the data for sending to API
    const formattedData = {
      task_id: parseInt(assignmentData.task_id, 10),
      user_id: parseInt(assignmentData.user_id, 10),
      status: assignmentData.status,
      assigned_at: assignmentData.assigned_at,
    };

    console.log("Creating assignment with data:", formattedData);
    const response = await api.post("/assignments", formattedData);
    return response.data;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

// Update an assignment - FIXED
const updateAssignment = async (id, assignmentData) => {
  try {
    // Ensure we're working with integers for IDs by forcing conversion
    const formattedData = {
      task_id: Number(assignmentData.task_id),
      user_id: Number(assignmentData.user_id),
      status: assignmentData.status || "Assigned",
      assigned_at: assignmentData.assigned_at,
    };

    console.log("Updating assignment with ID:", id);
    console.log("Raw assignment data:", assignmentData);
    console.log("Formatted data for API:", formattedData);

    // Make sure to send the proper format to the API
    const response = await api.put(`/assignments/${id}`, formattedData);

    console.log("Update response from server:", response);
    return response.data;
  } catch (error) {
    console.error("Complete error details:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    throw error;
  }
};

// Delete an assignment
const deleteAssignmentApi = async (id) => {
  try {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw error;
  }
};

const AssignmentsPage = () => {
  // State for assignments
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(1); // Default rating
  const [isEditing, setIsEditing] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    task_id: "",
    user_id: "",
    status: "Pending",
    assigned_at: new Date().toISOString().split("T")[0],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch assignments on component mount
  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAssignments();
      setAssignments(data);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to fetch assignments.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // handle feedback
  const handleFeedbackSubmit = async (assignmentId) => {
    try {
      await createFeedback({
        assignment_id: assignmentId,
        user_id: 1, // Replace with logged-in user ID
        rating: parseInt(rating, 10),
        comment: feedback,
      });

      Swal.fire({
        title: "Feedback Submitted",
        text: `Feedback: ${feedback}\nRating: ${rating}⭐`,
        icon: "success",
        confirmButtonText: "OK",
      });

      setFeedback("");
      setRating(1);
      setSelectedAssignment(null);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to submit feedback.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Add a new assignment
  const addAssignment = async () => {
    if (!newAssignment.task_id || !newAssignment.user_id) {
      Swal.fire({
        title: "Validation Error",
        text: "Task ID and User ID are required fields.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await createAssignment(newAssignment);
      console.log("Server response from create:", response);

      // Force a fresh fetch of assignments to ensure sync with server
      await fetchAssignments();

      setNewAssignment({
        task_id: "",
        user_id: "",
        status: "Assigned",
        assigned_at: new Date().toISOString().split("T")[0],
      });

      Swal.fire({
        title: "Assignment Added",
        text: "New assignment has been added successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text:
          "Failed to add assignment: " +
          (error.response?.data?.message || error.message),
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit an assignment - FIXED
  const editAssignment = async () => {
    if (!selectedAssignment || !selectedAssignment.assignment_id) {
      Swal.fire({
        title: "Error",
        text: "No assignment selected for editing.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        "Starting update process for assignment:",
        selectedAssignment
      );

      // Ensure data is formatted correctly for the API
      const updateData = {
        task_id: Number(selectedAssignment.task_id),
        user_id: Number(selectedAssignment.user_id),
        status: selectedAssignment.status || "Assigned",
        assigned_at: formatDateForInput(selectedAssignment.assigned_at),
      };

      console.log("Sending update with data:", updateData);

      // Call the update function
      const result = await updateAssignment(
        selectedAssignment.assignment_id,
        updateData
      );

      console.log("Update result:", result);

      // Force a fresh fetch of assignments to ensure sync with server
      await fetchAssignments();

      setSelectedAssignment(null);
      setIsEditing(false);

      Swal.fire({
        title: "Assignment Updated",
        text: "The assignment has been updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Complete error object:", error);
      Swal.fire({
        title: "Error",
        text:
          "Failed to update assignment: " +
          (error.response?.data?.message || error.message),
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an assignment
  const deleteAssignment = async (assignmentId) => {
    setIsLoading(true);
    try {
      await deleteAssignmentApi(assignmentId);

      // Force a fresh fetch of assignments to ensure sync with server
      await fetchAssignments();

      Swal.fire({
        title: "Assignment Deleted",
        text: "The assignment has been deleted successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text:
          "Failed to delete assignment: " +
          (error.response?.data?.message || error.message),
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input change for edit mode - FIXED
  const handleEditInputChange = (e, field) => {
    const value = e.target.value;

    console.log(`Updating ${field} to:`, value, typeof value);

    setSelectedAssignment((prev) => {
      if (!prev) return null;

      // Create a new object with the updated field
      const updated = {
        ...prev,
        [field]: value,
      };

      console.log("Updated assignment object:", updated);
      return updated;
    });
  };

  // Format date for the form
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If it contains a T (ISO format), split and take the date part
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }

    // Otherwise try to create a date and format it
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (e) {
      console.error("Invalid date format:", dateString);
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-6">
      <h1 className="text-5xl font-extrabold text-white mb-12 text-center drop-shadow-lg">
        Assignments Management
      </h1>

      {/* Add Assignment Form */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-indigo-600">
          Add New Assignment
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task ID *
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded-md"
              placeholder="Task ID"
              value={newAssignment.task_id}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, task_id: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID *
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded-md"
              placeholder="User ID"
              value={newAssignment.user_id}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, user_id: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border p-2 rounded-md"
              value={newAssignment.status}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, status: e.target.value })
              }
            >
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Date
            </label>
            <input
              type="date"
              className="w-full border p-2 rounded-md"
              value={newAssignment.assigned_at}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  assigned_at: e.target.value,
                })
              }
            />
          </div>

          <button
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all"
            onClick={addAssignment}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Assignment"}
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment.assignment_id}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold text-indigo-800">
              Task ID: {assignment.task_id}
            </h2>
            <p className="text-sm text-gray-700">
              User ID: {assignment.user_id}
            </p>
            <p className="text-sm text-gray-700">Status: {assignment.status}</p>
            <p className="text-sm text-gray-700">
              Assigned At:{" "}
              {new Date(assignment.assigned_at).toLocaleDateString()}
            </p>
            <div className="mt-4 space-x-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                onClick={() => {
                  // Store reference to original values as numbers
                  setSelectedAssignment({
                    ...assignment,
                    task_id: Number(assignment.task_id),
                    user_id: Number(assignment.user_id),
                  });
                  setIsEditing(true);
                }}
                disabled={isLoading}
              >
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
                onClick={() => deleteAssignment(assignment.assignment_id)}
                disabled={isLoading}
              >
                Delete
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
                onClick={() => {
                  setSelectedAssignment({ ...assignment });
                  setIsEditing(false);
                }}
                disabled={isLoading}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Feedback Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-indigo-600">
              {isEditing ? "Edit Assignment" : "Submit Feedback"} for Task ID:{" "}
              {selectedAssignment.task_id}
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task ID
                  </label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    value={selectedAssignment.task_id}
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded-md bg-gray-100 cursor-not-allowed"
                    value={selectedAssignment.user_id}
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full border p-2 rounded-md"
                    value={selectedAssignment.status || "Assigned"}
                    onChange={(e) => handleEditInputChange(e, "status")}
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Date
                  </label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded-md"
                    value={formatDateForInput(selectedAssignment.assigned_at)}
                    onChange={(e) => handleEditInputChange(e, "assigned_at")}
                  />
                </div>
              </div>
            ) : (
              <>
                <textarea
                  className="w-full border p-2 rounded-md mb-4"
                  placeholder="Enter your feedback here..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>

                <select
                  className="w-full border p-2 rounded-md mb-4"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="1">⭐ 1</option>
                  <option value="2">⭐⭐ 2</option>
                  <option value="3">⭐⭐⭐ 3</option>
                  <option value="4">⭐⭐⭐⭐ 4</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5</option>
                </select>
              </>
            )}
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-all"
                onClick={() => {
                  setSelectedAssignment(null);
                  setIsEditing(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all"
                onClick={() =>
                  isEditing
                    ? editAssignment()
                    : handleFeedbackSubmit(selectedAssignment.assignment_id)
                }
                disabled={isLoading}
              >
                {isLoading
                  ? isEditing
                    ? "Saving..."
                    : "Submitting..."
                  : isEditing
                  ? "Save Changes"
                  : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
