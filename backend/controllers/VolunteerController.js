import pool from "../index.js";

export const getVolunteers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id, 
        u.username,
        u.year,
        u.department, 
        u.skills, 
        u.availability,
        COALESCE(ROUND(AVG(f.rating), 1), 0) AS avg_rating
      FROM Users u
      LEFT JOIN Assignments a ON u.user_id = a.user_id
      LEFT JOIN Feedback f ON a.assignment_id = f.assignment_id
      WHERE u.role = 'Volunteer'
      GROUP BY u.user_id
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching volunteer details with ratings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const query = `
      UPDATE Tasks
      SET status = $1
      WHERE task_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, taskId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
