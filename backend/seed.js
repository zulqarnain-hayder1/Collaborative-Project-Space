const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/collaborative-space";
    console.log("Connecting to MongoDB for seeding:", mongoUri);
    await mongoose.connect(mongoUri);

    console.log("Cleaning old sample data...");
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log("Creating realistic demo users...");
    const demoPassword = "password123";

    const alex = await User.create({
      name: "Alex Morgan",
      email: "alex@intern.space",
      password: demoPassword,
    });

    const sara = await User.create({
      name: "Sara Chen",
      email: "sara@intern.space",
      password: demoPassword,
    });

    const jordan = await User.create({
      name: "Jordan Taylor",
      email: "jordan@intern.space",
      password: demoPassword,
    });

    const devUser = await User.create({
      name: "Demo Intern",
      email: "demo@intern.space",
      password: demoPassword,
    });

    console.log("Creating realistic collaborative projects...");
    const project1 = await Project.create({
      name: "🚀 AI Code Assistant Portal",
      description: "Next-gen developer portal featuring real-time code analysis, pair-programming rooms, and automated test suite execution.",
      createdBy: alex._id,
      members: [alex._id, sara._id, jordan._id, devUser._id],
      milestones: [
        { title: "Authentication & JWT Security", progress: 100, isCompleted: true },
        { title: "Kanban Drag-and-Drop Core", progress: 85, isCompleted: false },
        { title: "WebSocket Real-time Engine", progress: 60, isCompleted: false },
        { title: "Production Deployment & CI/CD", progress: 20, isCompleted: false },
      ],
    });

    const project2 = await Project.create({
      name: "📱 Mobile App Redesign 2.0",
      description: "Comprehensive UI/UX overhaul focusing on fluid gesture navigation, dark glassmorphism styling, and offline sync capabilities.",
      createdBy: sara._id,
      members: [sara._id, devUser._id],
      milestones: [
        { title: "Wireframes & User Testing", progress: 100, isCompleted: true },
        { title: "Design System Tokens", progress: 90, isCompleted: false },
        { title: "React Native Migration", progress: 40, isCompleted: false },
      ],
    });

    // Assign project IDs to users
    await User.updateMany(
      { _id: { $in: [alex._id, sara._id, jordan._id, devUser._id] } },
      { $addToSet: { projects: project1._id } }
    );
    await User.updateMany(
      { _id: { $in: [sara._id, devUser._id] } },
      { $addToSet: { projects: project2._id } }
    );

    console.log("Creating feature-packed tasks with subtasks and comments...");
    await Task.create([
      {
        title: "Setup MongoDB Indexes and Schema Validation",
        description: "Optimize query speed for project membership lookups and add indexing to task deadline fields.",
        status: "Completed",
        priority: "High",
        deadline: new Date(Date.now() - 86400000 * 2), // 2 days ago
        projectId: project1._id,
        createdBy: alex._id,
        assignedTo: alex._id,
        tags: ["Backend", "Database"],
        subtasks: [
          { title: "Create compound index on members field", isCompleted: true },
          { title: "Verify regex performance on user search", isCompleted: true },
        ],
        comments: [
          { user: alex._id, text: "Database query response times dropped by 65%! Ready for production load.", createdAt: new Date(Date.now() - 86400000 * 3) },
        ],
      },
      {
        title: "Implement Real-time WebSocket Task Movement",
        description: "Broadcast task drag-and-drop movements instantly to all online collaborators in the project room.",
        status: "In Progress",
        priority: "Critical",
        deadline: new Date(Date.now() + 86400000 * 1), // Tomorrow
        projectId: project1._id,
        createdBy: sara._id,
        assignedTo: devUser._id,
        tags: ["WebSockets", "Real-Time", "Frontend"],
        subtasks: [
          { title: "Connect socket room on project page load", isCompleted: true },
          { title: "Emit task-moved event with optimistic UI update", isCompleted: true },
          { title: "Handle reconnect & offline fallback", isCompleted: false },
        ],
        comments: [
          { user: jordan._id, text: "Tested with 3 simultaneous tabs and updates are instant 🔥", createdAt: new Date(Date.now() - 3600000 * 4) },
          { user: devUser._id, text: "Working on handling network reconnection gracefully now.", createdAt: new Date(Date.now() - 1800000) },
        ],
      },
      {
        title: "Design Glassmorphism Modal Dialogs",
        description: "Craft modern modal components for detailed task editing, comments, and member invitations.",
        status: "In Progress",
        priority: "Medium",
        deadline: new Date(Date.now() + 86400000 * 3),
        projectId: project1._id,
        createdBy: jordan._id,
        assignedTo: sara._id,
        tags: ["UI/UX", "Design"],
        subtasks: [
          { title: "Add backdrop blur effect", isCompleted: true },
          { title: "Implement keybindings (Esc, Ctrl+Enter)", isCompleted: false },
        ],
        comments: [],
      },
      {
        title: "Setup Automated CI/CD Deployment Pipeline",
        description: "Configure GitHub Actions or cloud provider deployment hooks for automated staging releases.",
        status: "To Do",
        priority: "Low",
        deadline: new Date(Date.now() + 86400000 * 7),
        projectId: project1._id,
        createdBy: alex._id,
        assignedTo: jordan._id,
        tags: ["DevOps", "CI/CD"],
        subtasks: [
          { title: "Write Dockerfile for production build", isCompleted: false },
          { title: "Configure staging environment variables", isCompleted: false },
        ],
        comments: [],
      },
    ]);

    console.log("\n✅ Database seeded successfully!");
    console.log("--------------------------------------------------");
    console.log("Demo Credentials:");
    console.log("Email: demo@intern.space | Password: password123");
    console.log("Email: alex@intern.space | Password: password123");
    console.log("--------------------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
