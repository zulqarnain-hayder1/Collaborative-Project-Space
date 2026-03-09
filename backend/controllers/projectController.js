const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

const createProject = async (req, res) => {
  try {
    const { name, description, memberEmails = [], milestones = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const usersFromEmails = await User.find({ email: { $in: memberEmails.map((email) => email.toLowerCase()) } });

    const memberIds = new Set([req.user.id, ...usersFromEmails.map((user) => String(user._id))]);

    const project = await Project.create({
      name,
      description,
      members: [...memberIds],
      milestones,
      createdBy: req.user.id,
    });

    await User.updateMany(
      { _id: { $in: [...memberIds] } },
      { $addToSet: { projects: project._id } }
    );

    const populatedProject = await Project.findById(project._id).populate("members", "name email");

    return res.status(201).json(populatedProject);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create project", error: error.message });
  }
};

const getProjectsForUser = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id })
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("members", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some((member) => String(member._id || member) === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tasks = await Task.find({ projectId: project._id }).sort({ createdAt: -1 });

    return res.status(200).json({ project, tasks });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch project", error: error.message });
  }
};

const updateMilestones = async (req, res) => {
  try {
    const { milestones } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (String(project.createdBy) !== req.user.id) {
      return res.status(403).json({ message: "Only project admin can update milestones" });
    }

    project.milestones = milestones;
    await project.save();

    const populated = await Project.findById(project._id).populate("members", "name email");

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update milestones", error: error.message });
  }
};

const joinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.members = Array.from(new Set([...project.members.map(String), req.user.id]));
    await project.save();

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { projects: project._id },
    });

    const populated = await Project.findById(project._id).populate("members", "name email");
    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to join project", error: error.message });
  }
};

module.exports = {
  createProject,
  getProjectsForUser,
  getProjectById,
  updateMilestones,
  joinProject,
};
