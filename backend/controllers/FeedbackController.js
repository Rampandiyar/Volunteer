import pool from "../index.js";

//Create Feedback
export const createFeedback = async (req, res) => {
  const { assignment_id, user_id, rating, comment } = req.body;

  if (!assignment_id || !user_id || !rating || !comment) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO feedback (assignment_id, user_id, rating, comment) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [assignment_id, user_id, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).send("Server error");
  }
};

//Get All Feedback
export const getAllFeedback = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM feedback ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).send("Server error");
  }
};

//Get Feedback by Assignment ID
export const getFeedbackByAssignment = async (req, res) => {
  const { assignment_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM feedback WHERE assignment_id = $1 ORDER BY created_at DESC",
      [assignment_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No feedback found for this assignment" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).send("Server error");
  }
};

//Update Feedback
export const updateFeedback = async (req, res) => {
  const { feedback_id } = req.params;
  const { rating, comment } = req.body;

  try {
    const result = await pool.query(
      "UPDATE feedback SET rating = $1, comment = $2 WHERE feedback_id = $3 RETURNING *",
      [rating, comment, feedback_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).send("Server error");
  }
};

// Delete Feedback
export const deleteFeedback = async (req, res) => {
  const { feedback_id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM feedback WHERE feedback_id = $1 RETURNING *",
      [feedback_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res
      .status(200)
      .json({ message: "Feedback deleted", deletedFeedback: result.rows[0] });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).send("Server error");
  }
};

// Get Feedback by Volunteer ID
export const getFeedbackByVolunteer = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM feedback WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No feedback found for this volunteer" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching feedback by volunteer:", error);
    res.status(500).send("Server error");
  }
};
