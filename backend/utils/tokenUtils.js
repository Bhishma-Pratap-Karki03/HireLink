const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    { expiresIn: "360000s" }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
