const express = require("express");
const { register, login, searchUsers } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users/search", authMiddleware, searchUsers);

module.exports = router;

