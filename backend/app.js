const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/userRoutes");


app.use(cors());

// Parse JSON bodies
app.use(express.json());

// User Routes
app.use("/api/users", userRoutes);

module.exports = app;
