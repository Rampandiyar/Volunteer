import express from "express";
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  getVolunteerCheckIns,
  getVolunteerHours,
  getUserById,
  getVolunteersCheckIns,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/add", createUser); // Register a new user
router.post("/login", loginUser); // User login

// Protected routes (Require authentication)
router.put("/logout", logoutUser); // User logout
router.get("/all", getAllUsers); // Get all users
router.put("/update/:id", updateUser); // Update user
router.delete("/delete/:id", deleteUser); // Delete user
router.get("/get/:id", getUserById);
// Volunteer tracking routes
router.get("/checkins", getVolunteerCheckIns); // Get all check-ins
router.get("/volunteers/checkins", getVolunteersCheckIns); // Get all check-ins
router.get("/hours", getVolunteerHours); // Get volunteer hours

export default router;
