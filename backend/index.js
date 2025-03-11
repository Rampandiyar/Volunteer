import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adashboardRoutes from "./routes/Adashboardroutes.js";
import volunteerRoutes from "./routes/VolunteerRoutes.js";
import dashboardRoutes from "./routes/DashboardRoutes.js";
import feedbackRoutes from "./routes/Feedbackroutes.js";
import activitylogroutes from "./routes/Activitylogroutes.js";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect((err) => {
  if (err) {
    console.error("Error acquiring client", err);
  } else {
    console.log("Connected to database");
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initializeDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, "db.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schemaSQL); // Execute the schema SQL
    console.log("✅ Database schema initialized successfully.");
  } catch (err) {
    console.error("❌ Error initializing database schema:", err);
  }
};

//BACKEND ROUTES

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/adashboard", adashboardRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/activitylogs", activitylogroutes);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the PERN Stack Backend!");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the pool for use in other modules
export default pool;
