const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const userRoutes = require("./routes/userRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const profileRoutes = require("./routes/profileRoutes");

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from public/uploads directory
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/profile", profileRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

module.exports = app;
