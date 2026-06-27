const mongoose = require("mongoose");

const getMongoUri = () => {
  const rawUri = process.env.MONGO_URI && process.env.MONGO_URI.trim();
  const defaultUri = "mongodb://127.0.0.1:27017/collaborative_project_space";

  if (!rawUri) {
    return defaultUri;
  }

  const uriHasDatabase = /mongodb(?:\+srv)?:\/\/[^/]+\/.+/.test(rawUri);
  return uriHasDatabase ? rawUri : `${rawUri}/collaborative_project_space`;
};

const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
