const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.AUTH_SECRET_KEY, {
    expiresIn: "7d",
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.AUTH_SECRET_KEY);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
