const app = require("./app");
const connectDB = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
