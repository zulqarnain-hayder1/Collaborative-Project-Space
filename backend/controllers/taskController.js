const Project = require("../models/Project");
const Task = require("../models/Task");

const isProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return { allowed: false, reason: "Project not found" };
  }

  const memberAllowed = project.members.some((member) => String(member) === userId);
  if (!memberAllowed) {
    return { allowed: false, reason: "Access denied" };
  }

  return { allowed: true, project };
};

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, deadline, priority, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: "Title and projectId are required" });
    }

    const permission = await isProjectMember(projectId, req.user.id);
    if (!permission.allowed) {
      return res.status(permission.reason === "Project not found" ? 404 : 403).json({ message: permission.reason });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || null,
      status: status || "To Do",
      deadline: deadline || null,
      priority: priority || "Medium",
      projectId,
      createdBy: req.user.id,
    });

    const populatedTask = await Task.findById(task._id).populate("assignedTo", "name email");

    const io = req.app.get("io");
    io.to(projectId).emit("task-created", populatedTask);

    return res.status(201).json(populatedTask);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const permission = await isProjectMember(projectId, req.user.id);

    if (!permission.allowed) {
      return res.status(permission.reason === "Project not found" ? 404 : 403).json({ message: permission.reason });
    }

    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const permission = await isProjectMember(task.projectId, req.user.id);
    if (!permission.allowed) {
      return res.status(permission.reason === "Project not found" ? 404 : 403).json({ message: permission.reason });
    }

    const previousStatus = task.status;

    Object.assign(task, req.body);
    await task.save();

    const populatedTask = await Task.findById(task._id).populate("assignedTo", "name email");
    const io = req.app.get("io");

    io.to(String(task.projectId)).emit("task-updated", populatedTask);

    if (req.body.status && req.body.status !== previousStatus) {
      io.to(String(task.projectId)).emit("task-moved", {
        taskId: task._id,
        status: req.body.status,
      });
    }

    return res.status(200).json(populatedTask);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const permission = await isProjectMember(task.projectId, req.user.id);
    if (!permission.allowed) {
      return res.status(permission.reason === "Project not found" ? 404 : 403).json({ message: permission.reason });
    }

    await task.deleteOne();

    const io = req.app.get("io");
    io.to(String(task.projectId)).emit("task-deleted", {
      taskId: String(task._id),
      projectId: String(task.projectId),
    });

    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
};
