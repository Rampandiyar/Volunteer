// src/routes/notificationRoutes.js
import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  sendNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", sendNotification);
router.get("/n:user_id", getUserNotifications);
router.put("/:id", markNotificationAsRead);

export default router;
