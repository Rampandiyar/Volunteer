import bcrypt from "bcrypt";
import pool from "../index.js"; // Ensure you import your database connection
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM Users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await pool.query(
      "INSERT INTO VolunteerCheckIns (user_id, checkin_time) VALUES ($1, CURRENT_TIMESTAMP)",
      [user.user_id]
    );

    const userResponse = { ...user };
    delete userResponse.password;

    res
      .status(200)
      .json({ message: "Login successful", token, user: userResponse });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  const { userId } = req.body; // Read userId from the request body

  try {
    const result = await pool.query(
      `UPDATE VolunteerCheckIns 
       SET checkout_time = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND checkout_time IS NULL 
       RETURNING *`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "No active check-in record found" });
    }

    res
      .status(200)
      .json({ message: "Logout successful", record: result.rows[0] });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Create User - now with default values for skills, interests, and availability
export const createUser = async (req, res) => {
  const { username, password, role, email, phone, year, department } = req.body;

  try {
    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the user into the database with default values for new fields
    const result = await pool.query(
      `INSERT INTO Users (
        username, password, role, email, phone, year, department, 
        skills, interests, availability
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        username,
        hashedPassword,
        role,
        email,
        phone,
        year,
        department,
        "enter skills", // Default empty value for skills
        "enter skills", // Default empty value for interests
        "Weekdays", // Default value for availability
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).json({ error: "Server error. Could not create user." });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Users");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM Users WHERE user_id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Update User - Fixed version that properly handles all fields
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    username,
    password,
    role,
    email,
    phone,
    year,
    department,
    skills,
    interests,
    availability,
  } = req.body;

  try {
    let hashedPassword = null;

    // Check if password is provided in the request
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Update query with proper comma placement and variable declarations
    const result = await pool.query(
      `UPDATE Users 
       SET username = $1, 
           password = COALESCE($2, password), 
           role = $3, 
           email = $4, 
           phone = $5,
           year = $6,
           department = $7, 
           skills = $8,
           interests = $9,
           availability = $10
       WHERE user_id = $11 
       RETURNING *`,
      [
        username,
        hashedPassword,
        role,
        email,
        phone,
        year,
        department,
        skills,
        interests,
        availability,
        id,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).send("Server error");
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Users WHERE user_id = $1", [id]);
    res.status(204).send("User deleted");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get Volunteer Check-Ins
export const getVolunteerCheckIns = async (req, res) => {
  const { userId } = req.query; // Optional: Fetch check-ins for a specific user

  try {
    let query = "SELECT * FROM VolunteerCheckIns";
    let params = [];

    if (userId) {
      query += " WHERE user_id = $1";
      params.push(userId);
    }

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching check-ins:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get Volunteer Check-Ins (Exclude Admins)
export const getVolunteersCheckIns = async (req, res) => {
  try {
    const query = `
      SELECT vc.*
      FROM VolunteerCheckIns vc
      JOIN Users u ON vc.user_id = u.user_id
      WHERE u.role != 'Admin'`; // Exclude users with admin role

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching check-ins:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get Volunteer Hours
export const getVolunteerHours = async (req, res) => {
  const { userId } = req.query; // Optional: Fetch hours for a specific user
  try {
    let query = `
      SELECT user_id, 
             SUM(EXTRACT(EPOCH FROM (checkout_time - checkin_time)) / 3600) AS total_hours
      FROM VolunteerCheckIns
      WHERE checkout_time IS NOT NULL
    `;
    let params = [];

    if (userId) {
      query += " AND user_id = $1";
      params.push(userId);
    }

    query += " GROUP BY user_id";

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error calculating volunteer hours:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
