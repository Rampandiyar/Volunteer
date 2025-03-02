// controllers/volunteerController.js
import pool from "../index.js";

// Get tasks assigned to a specific volunteer
export const getAssignedTasks = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = await pool.query(
      `SELECT 
        t.task_id,
        t.task_name,
        t.description,
        t.required_skills,
        a.status,
        a.assignment_id
       FROM Tasks t
       JOIN Assignments a ON t.task_id = a.task_id
       WHERE a.user_id = $1 AND a.status != 'Completed'
       ORDER BY a.priority_level DESC`,
      [userId]
    );

    // Format the tasks for frontend display
    const formattedTasks = query.rows.map((task, index) => ({
      id: task.task_id,
      assignmentId: task.assignment_id,
      title: `Task ${index + 1}`,
      description: task.description,
      skills: task.required_skills.split(",").map((skill) => skill.trim()),
      status: task.status,
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error("Error getting assigned tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUpcomingEvents = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = await pool.query(
      `SELECT 
        e.event_id,
        e.event_name,
        e.description,
        e.start_date,
        e.location,
        t.task_id,
        t.task_name
       FROM Events e
       LEFT JOIN Tasks t ON e.event_id = t.event_id
       LEFT JOIN Assignments a ON t.task_id = a.task_id
       WHERE e.start_date >= CURRENT_DATE 
       AND (a.assignment_id IS NULL OR a.user_id != $1)
       ORDER BY e.start_date ASC
       LIMIT 5`,
      [userId]
    );

    // Group tasks by event
    const eventMap = {};
    query.rows.forEach((row) => {
      if (!eventMap[row.event_id]) {
        eventMap[row.event_id] = {
          id: row.event_id,
          title: row.event_name,
          description: row.description,
          date: new Date(row.start_date).toISOString().split("T")[0],
          location: row.location,
          availableTasks: [],
        };
      }
      if (row.task_id) {
        eventMap[row.event_id].availableTasks.push({
          id: row.task_id,
          name: row.task_name,
        });
      }
    });

    res.json(Object.values(eventMap));
  } catch (error) {
    console.error("Error getting upcoming events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get volunteer task statistics
export const getTaskStatistics = async (req, res) => {
  const { userId } = req.params;

  try {
    // Get total tasks assigned to volunteer
    const totalTasksQuery = await pool.query(
      `SELECT COUNT(*) FROM Assignments WHERE user_id = $1`,
      [userId]
    );

    // Get completed tasks
    const completedTasksQuery = await pool.query(
      `SELECT COUNT(*) FROM Assignments WHERE user_id = $1 AND status = 'Completed'`,
      [userId]
    );

    // Get total hours logged
    const hoursQuery = await pool.query(
      `SELECT SUM(hours_logged) FROM ActivityLogs WHERE user_id = $1`,
      [userId]
    );

    const stats = {
      totalTasks: parseInt(totalTasksQuery.rows[0].count),
      completedTasks: parseInt(completedTasksQuery.rows[0].count),
      totalHoursLogged: parseFloat(hoursQuery.rows[0].sum || 0),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting task statistics:", error);
    res.status(500).json({ message: "Server error" });
  }
};
