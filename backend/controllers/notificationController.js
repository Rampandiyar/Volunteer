import pool from "../index.js";
import nodemailer from "nodemailer";

// Send Notification and Email to User
export const sendNotification = async (req, res) => {
  const { user_id, message, status = "Sent" } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ error: "User ID and message are required" });
  }

  try {
    // Fetch user's email from the database
    const userResult = await pool.query(
      "SELECT email FROM Users WHERE user_id = $1",
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userEmail = userResult.rows[0].email;

    // Insert notification into the database
    const notificationResult = await pool.query(
      `INSERT INTO Notifications (user_id, message, status) 
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, message, status]
    );

    const notification = notificationResult.rows[0];

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "New Notification",
      text: `Hello, you have a new notification:\n\n${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({
      message: "Notification sent successfully",
      notification,
    });
  } catch (err) {
    console.error("Send notification error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM Notifications WHERE user_id = $1 ORDER BY sent_at DESC`,
      [user_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get notifications error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE Notifications SET status = 'Read' WHERE notification_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification: result.rows[0],
    });
  } catch (err) {
    console.error("Mark as read error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};

// Mark multiple notifications as read
export const markMultipleNotificationsAsRead = async (req, res) => {
  const { notification_ids } = req.body;

  if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
    return res.status(400).json({
      error: "Invalid request",
      details: "No valid notification IDs provided",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE Notifications 
       SET status = 'Read' 
       WHERE notification_id = ANY($1) RETURNING *`,
      [notification_ids]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "No notifications found for the given IDs" });
    }

    res.status(200).json({
      message: "Notifications marked as read",
      updated_count: result.rowCount,
    });
  } catch (err) {
    console.error("Mark multiple as read error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};
