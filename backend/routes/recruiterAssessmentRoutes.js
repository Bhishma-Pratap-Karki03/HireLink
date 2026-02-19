const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const recruiterAssessmentController = require("../controllers/recruiterAssessmentController");
const recruiterAssessmentAttemptController = require("../controllers/recruiterAssessmentAttemptController");

const router = express.Router();

router.post("/", protect, recruiterAssessmentController.createRecruiterAssessment);
router.get("/:id", recruiterAssessmentController.getRecruiterAssessmentById);
router.put("/:id", protect, recruiterAssessmentController.updateRecruiterAssessment);
router.get(
  "/:id/meta",
  protect,
  recruiterAssessmentAttemptController.getRecruiterAssessmentMeta,
);
router.post(
  "/:id/attempts/start",
  protect,
  recruiterAssessmentAttemptController.startRecruiterAttempt,
);
router.post(
  "/:id/attempts/:attemptId/answers",
  protect,
  recruiterAssessmentAttemptController.saveRecruiterAnswers,
);
router.post(
  "/:id/attempts/:attemptId/submit",
  protect,
  recruiterAssessmentAttemptController.submitRecruiterAttempt,
);

module.exports = router;
