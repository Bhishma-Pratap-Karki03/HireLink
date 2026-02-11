// User Routes - defines API endpoints for user registration and login

const express = require("express");
const router = express.Router();
const { registerUser, loginUser, listCandidates } = require("../controllers/userController");

// POST /api/users/register - Register a new user
router.post("/register", registerUser);

// POST /api/users/login - Login an existing user
router.post("/login", loginUser);
// GET /api/users/candidates - List candidates (recruiter/admin)
router.get("/candidates", listCandidates);

module.exports = router;
