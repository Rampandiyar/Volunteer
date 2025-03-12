// src/routes/taskRoutes.js
import express from "express";
import {
  createTask,
  getAllTasks,
  getUserAssignments,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:userId", getUserAssignments);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
