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
    const response = await api.post("/assignments", assignmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

// Update an assignment
const updateAssignment = async (id, assignmentData) => {
  try {
    const response = await api.put(`/assignments/${id}`, assignmentData);
    return response.data;
  } catch (error) {
    console.error("Error updating assignment:", error);
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

  // Fetch assignments on component mount
  useEffect(() => {
    const fetchAssignments = async () => {
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
      }
    };
    fetchAssignments();
  }, []);
  // handle feedback
  const handleFeedbackSubmit = async (assignmentId) => {
    try {
      await createFeedback({
        assignment_id: assignmentId,
        user_id: 1, // Replace with logged-in user ID
        rating,
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
    try {
      const response = await createAssignment(newAssignment);
      setAssignments([...assignments, response]);
      setNewAssignment({
        task_id: "",
        user_id: "",
        status: "Pending",
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
        text: "Failed to add assignment.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Edit an assignment
  const editAssignment = async () => {
    try {
      const response = await updateAssignment(
        selectedAssignment.assignment_id,
        selectedAssignment
      );
      const updatedAssignments = assignments.map((assign) =>
        assign.assignment_id === selectedAssignment.assignment_id
          ? response
          : assign
      );
      setAssignments(updatedAssignments);
      setSelectedAssignment(null);
      setIsEditing(false);
      Swal.fire({
        title: "Assignment Updated",
        text: "The assignment has been updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to update assignment.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Delete an assignment
  const deleteAssignment = async (assignmentId) => {
    try {
      await deleteAssignmentApi(assignmentId);
      const updatedAssignments = assignments.filter(
        (assign) => assign.assignment_id !== assignmentId
      );
      setAssignments(updatedAssignments);
      Swal.fire({
        title: "Assignment Deleted",
        text: "The assignment has been deleted successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to delete assignment.",
        icon: "error",
        confirmButtonText: "OK",
      });
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
          <input
            type="number"
            className="w-full border p-2 rounded-md"
            placeholder="Task ID"
            value={newAssignment.task_id}
            onChange={(e) =>
              setNewAssignment({ ...newAssignment, task_id: e.target.value })
            }
          />
          <input
            type="number"
            className="w-full border p-2 rounded-md"
            placeholder="User ID"
            value={newAssignment.user_id}
            onChange={(e) =>
              setNewAssignment({ ...newAssignment, user_id: e.target.value })
            }
          />
          <select
            className="w-full border p-2 rounded-md"
            value={newAssignment.status}
            onChange={(e) =>
              setNewAssignment({ ...newAssignment, status: e.target.value })
            }
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
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
          <button
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-all"
            onClick={addAssignment}
          >
            Add Assignment
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
                  setSelectedAssignment(assignment);
                  setIsEditing(true);
                }}
              >
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
                onClick={() => deleteAssignment(assignment.assignment_id)}
              >
                Delete
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
                onClick={() => setSelectedAssignment(assignment)}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Feedback Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-indigo-600">
              {isEditing ? "Edit Assignment" : "Submit Feedback"} for Task ID:{" "}
              {selectedAssignment.task_id}
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="number"
                  className="w-full border p-2 rounded-md"
                  placeholder="Task ID"
                  value={selectedAssignment.task_id}
                  onChange={(e) =>
                    setSelectedAssignment({
                      ...selectedAssignment,
                      task_id: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  className="w-full border p-2 rounded-md"
                  placeholder="User ID"
                  value={selectedAssignment.user_id}
                  onChange={(e) =>
                    setSelectedAssignment({
                      ...selectedAssignment,
                      user_id: e.target.value,
                    })
                  }
                />
                <select
                  className="w-full border p-2 rounded-md"
                  value={selectedAssignment.status}
                  onChange={(e) =>
                    setSelectedAssignment({
                      ...selectedAssignment,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <input
                  type="date"
                  className="w-full border p-2 rounded-md"
                  value={selectedAssignment.assigned_at}
                  onChange={(e) =>
                    setSelectedAssignment({
                      ...selectedAssignment,
                      assigned_at: e.target.value,
                    })
                  }
                />
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
              >
                {isEditing ? "Save Changes" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
