import express from "express";
import { logVolunteerHours } from "../controllers/ActivityLogControllers.js";

const router = express.Router();

// POST request to log volunteer hours
router.post("/log-hours", logVolunteerHours);

export default router;
