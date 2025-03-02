import express from "express";
import {
  createFeedback,
  getAllFeedback,
  getFeedbackByAssignment,
  updateFeedback,
  deleteFeedback,
  getFeedbackByVolunteer,
} from "../controllers/FeedbackController.js";

const router = express.Router();

router.post("/", createFeedback);
router.get("/", getAllFeedback);
router.get("/:user_id", getFeedbackByVolunteer);
router.get("/:assignment_id", getFeedbackByAssignment);
router.put("/:feedback_id", updateFeedback);
router.delete("/:feedback_id", deleteFeedback);

export default router;
