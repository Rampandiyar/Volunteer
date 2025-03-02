// src/controllers/dashboardController.js
import pool from "../index.js";

// Get dashboard statistics
export const getStats = async (req, res) => {
  try {
    const totalVolunteers = await pool.query(
      "SELECT COUNT(*) FROM Users WHERE role = 'Volunteer'"
    );
    const totalTasks = await pool.query("SELECT COUNT(*) FROM Tasks");
    const upcomingEvents = await pool.query(
      "SELECT COUNT(*) FROM Events WHERE start_date > CURRENT_DATE"
    );
    const volunteerHours = await pool.query(
      "SELECT SUM(hours_logged) FROM ActivityLogs"
    );

    const stats = {
      totalVolunteers: parseInt(totalVolunteers.rows[0].count),
      totalTasks: parseInt(totalTasks.rows[0].count),
      upcomingEvents: parseInt(upcomingEvents.rows[0].count),
      volunteerHours: parseFloat(volunteerHours.rows[0].sum || 0),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

// Get task completion data
export const getTaskCompletion = async (req, res) => {
  try {
    const completedTasks = await pool.query(
      "SELECT COUNT(*) FROM Tasks WHERE status = 'Completed'"
    );
    const totalTasks = await pool.query("SELECT COUNT(*) FROM Tasks");

    const taskCompletion = {
      completed: parseInt(completedTasks.rows[0].count),
      total: parseInt(totalTasks.rows[0].count),
    };

    res.json(taskCompletion);
  } catch (error) {
    console.error("Error fetching task completion data:", error);
    res.status(500).json({ error: "Failed to fetch task completion data" });
  }
};

// Get top volunteers by hours
export const getTopVolunteers = async (req, res) => {
  try {
    const query = `SELECT u.username as name, SUM(a.hours_logged) as hours FROM Users u JOIN ActivityLogs a ON u.user_id = a.user_id
      WHERE u.role = 'Volunteer' GROUP BY u.username ORDER BY hours DESC LIMIT 5`;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching volunteer hours:", error);
    res.status(500).json({ error: "Failed to fetch volunteer hours data" });
  }
};

// Get top volunteer of the month
export const getTopVolunteerOfMonth = async (req, res) => {
  try {
    const query = `
      SELECT u.username as name, SUM(a.hours_logged) as hours
      FROM Users u
      JOIN ActivityLogs a ON u.user_id = a.user_id
      WHERE u.role = 'Volunteer'
        AND a.log_date >= date_trunc('month', CURRENT_DATE)
        AND a.log_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
      GROUP BY u.username
      ORDER BY hours DESC
      LIMIT 1
    `;

    const result = await pool.query(query);
    res.json(result.rows[0] || { name: "No data", hours: 0 });
  } catch (error) {
    console.error("Error fetching top volunteer:", error);
    res.status(500).json({ error: "Failed to fetch top volunteer data" });
  }
};

// Get recent activity logs
export const getActivityLogs = async (req, res) => {
  try {
    const query = `
      SELECT 
        al.log_id as id,
        u.username as username,
        t.task_name,
        e.event_name,
        al.log_date as date,
        al.hours_logged as hours
      FROM ActivityLogs al
      JOIN Users u ON al.user_id = u.user_id
      JOIN Tasks t ON al.task_id = t.task_id
      JOIN Events e ON al.event_id = e.event_id
      ORDER BY al.log_date DESC
      LIMIT 5
    `;

    const result = await pool.query(query);

    // Format activity logs for frontend display
    const formattedLogs = result.rows.map((log) => {
      return {
        id: log.id,
        activity: `${log.username} completed task: ${log.task_name} for ${log.event_name}`,
        date: new Date(log.date).toISOString().split("T")[0],
        hours: log.hours,
      };
    });

    res.json(formattedLogs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};

// Get notifications
export const getNotifications = async (req, res) => {
  try {
    const query = `
      SELECT 
        notification_id as id, 
        message, 
        sent_at,
        CASE 
          WHEN message LIKE '%registration%' THEN 'info'
          WHEN message LIKE '%overdue%' THEN 'warning'
          WHEN message LIKE '%upcoming%' THEN 'alert'
          ELSE 'info'
        END as type
      FROM Notifications
      ORDER BY sent_at DESC
      LIMIT 5
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};
