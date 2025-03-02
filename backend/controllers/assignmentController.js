// src/controllers/assignmentController.js
import pool from "../index.js";

// Assign a task to a user
export const createAssignment = async (req, res) => {
  const { task_id, user_id, priority_level, estimated_completion_time } =
    req.body;
  try {
    const result = await pool.query(
      "INSERT INTO Assignments (task_id, user_id, priority_level, estimated_completion_time) VALUES ($1, $2, $3, $4) RETURNING *",
      [task_id, user_id, priority_level, estimated_completion_time]
    );

    // Send notification to the user
    await pool.query(
      "INSERT INTO Notifications (user_id, message) VALUES ($1, $2)",
      [user_id, `You have been assigned a new task: Task ID ${task_id}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get all assignments
export const getAllAssignments = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Assignments");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get a single assignment by ID
export const getAssignmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM Assignments WHERE assignment_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Assignment not found");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update assignment status
export const updateAssignmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE Assignments SET status = $1 WHERE assignment_id = $2 RETURNING *",
      [status, id]
    );

    // Send notification if task is completed
    if (status === "Completed") {
      const assignment = result.rows[0];
      await pool.query(
        "INSERT INTO Notifications (user_id, message) VALUES ($1, $2)",
        [
          assignment.user_id,
          `Task ID ${assignment.task_id} has been completed.`,
        ]
      );
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Delete an assignment
export const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM Assignments WHERE assignment_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Assignment not found");
    }
    res
      .status(200)
      .json({
        message: "Assignment deleted",
        deletedAssignment: result.rows[0],
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
