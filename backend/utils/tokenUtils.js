const jwt = require("jsonwebtoken");

const generateToken = (userId, expiresIn = "7d") => {
  return jwt.sign({ id: userId }, process.env.AUTH_SECRET_KEY, {
    expiresIn: expiresIn,
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
