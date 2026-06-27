const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTask,
  getProjectTasks,
  updateTask,
  addTaskComment,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTask);
router.get("/:projectId", getProjectTasks);
router.put("/:id", updateTask);
router.post("/:id/comments", addTaskComment);
router.delete("/:id", deleteTask);

module.exports = router;
