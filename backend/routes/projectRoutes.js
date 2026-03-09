const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createProject,
  getProjectsForUser,
  getProjectById,
  updateMilestones,
  joinProject,
} = require("../controllers/projectController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createProject);
router.get("/", getProjectsForUser);
router.get("/:id", getProjectById);
router.put("/:id/join", joinProject);
router.put("/:id/milestones", updateMilestones);

module.exports = router;
