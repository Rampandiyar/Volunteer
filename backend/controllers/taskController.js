// src/controllers/taskController.js
import pool from "../index.js";

// Create a new task
export const createTask = async (req, res) => {
  const { event_id, task_name, description, required_skills, status } =
    req.body;
  try {
    const result = await pool.query(
      "INSERT INTO Tasks (event_id, task_name, description, required_skills, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [event_id, task_name, description, required_skills, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Tasks");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
// Get all tasks assigned to a specific user
export const getUserAssignments = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT a.assignment_id, t.task_id, t.event_id, t.task_name, t.description, 
              t.required_skills, t.status as task_status
       FROM Assignments a
       JOIN Tasks t ON a.task_id = t.task_id
       WHERE a.user_id = $1
       ORDER BY a.priority_level DESC, a.assigned_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update a task
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { task_name, description, required_skills, status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE Tasks SET task_name = $1, description = $2, required_skills = $3, status = $4 WHERE task_id = $5 RETURNING *",
      [task_name, description, required_skills, status, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Tasks WHERE task_id = $1", [id]);
    res.status(204).send("Task deleted");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
