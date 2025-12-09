const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // User role: 'admin', 'candidate', or 'recruiter'
    role: {
      type: String,
      enum: ["admin", "candidate", "recruiter"],
      default: "candidate",
    },

    // Email verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      default: null,
    },

    verificationCodeExpires: {
      type: Date,
      default: null,
    },

    // Password reset fields
    resetCode: {
      type: String,
      default: null,
    },

    resetCodeExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

module.exports = mongoose.model("User", userSchema);
