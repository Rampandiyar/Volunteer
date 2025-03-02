import pool from "../index.js"; // Assuming you have a DB connection set up

// Function to log volunteer hours automatically
export const logVolunteerHours = async (req, res) => {
  try {
    const { user_id, event_id, task_id, hours_logged } = req.body;

    // Ensure all required fields are provided
    if (!user_id || !task_id || !hours_logged) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert the logged hours into the ActivityLogs table
    const result = await db.query(
      `INSERT INTO ActivityLogs (user_id, event_id, task_id, log_date, hours_logged)
       VALUES ($1, $2, $3, CURRENT_DATE, $4) RETURNING *`,
      [user_id, event_id || null, task_id, hours_logged]
    );

    res.status(201).json({
      message: "Volunteer hours logged successfully",
      log: result.rows[0],
    });
  } catch (error) {
    console.error("Error logging volunteer hours:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
