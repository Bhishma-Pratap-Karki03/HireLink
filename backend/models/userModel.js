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
      trim: true,
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

    // Profile fields
    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },

    currentJobTitle: {
      type: String,
      default: "",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    // Connections count (for future implementation)
    connectionsCount: {
      type: Number,
      default: 0,
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
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.verificationCode;
        delete ret.resetCode;
        return ret;
      },
    },
  }
);

// Hash password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
