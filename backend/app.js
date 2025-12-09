const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const userRoutes = require("./routes/userRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

app.use(cors());

// Parse JSON bodies
app.use(express.json());

// User Routes
app.use("/api/users", userRoutes);

// Verification Routes
app.use("/api/verify", verificationRoutes);

// Password Routes
app.use("/api/password", passwordRoutes);

module.exports = app;
