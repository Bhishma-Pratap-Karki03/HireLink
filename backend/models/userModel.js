const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const workspaceImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const experienceSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
    trim: true,
  },
  jobType: {
    type: String,
    enum: [
      "Full-time",
      "Part-time",
      "Contract",
      "Freelance",
      "Internship",
      "Remote",
    ],
    default: "Full-time",
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

experienceSchema.pre("save", function (next) {
  if (this.isCurrent) {
    this.endDate = null;
  }
  this.updatedAt = Date.now();
  next();
});

const languageSchema = new mongoose.Schema({
  languageName: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const certificationSchema = new mongoose.Schema({
  certificationName: {
    type: String,
    required: true,
    trim: true,
  },
  issuingOrganization: {
    type: String,
    required: true,
    trim: true,
  },
  credentialId: {
    type: String,
    default: "",
  },
  issueDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
    default: null,
  },
  doesNotExpire: {
    type: Boolean,
    default: false,
  },
  credentialUrl: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

certificationSchema.pre("save", function (next) {
  if (this.doesNotExpire) {
    this.expirationDate = null;
  }
  this.updatedAt = Date.now();
  next();
});

const skillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    trim: true,
  },
  proficiencyLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    default: "Intermediate",
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 50,
    default: 1,
  },
  category: {
    type: String,
    enum: [
      "Technical",
      "Soft Skills",
      "Tools",
      "Languages",
      "Framework",
      "Database",
      "Other",
    ],
    default: "Technical",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const educationSchema = new mongoose.Schema({
  degreeTitle: {
    type: String,
    required: true,
    trim: true,
  },
  degreeType: {
    type: String,
    enum: [
      "High School",
      "Associate",
      "Bachelor's",
      "Master's",
      "Doctorate",
      "Diploma",
      "Certificate",
      "Other",
    ],
    default: "Bachelor's",
  },
  institution: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

educationSchema.pre("save", function (next) {
  if (this.isCurrent) {
    this.endDate = null;
  }
  this.updatedAt = Date.now();
  next();
});
const projectSchema = new mongoose.Schema({
  projectTitle: {
    type: String,
    required: true,
    trim: true,
  },
  projectDescription: {
    type: String,
    default: "",
  },
  coverImage: {
    type: String,
    default: "",
  },
  coverImageFileName: {
    type: String,
    default: "",
  },
  coverImageFileSize: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  isOngoing: {
    type: Boolean,
    default: false,
  },
  projectUrl: {
    type: String,
    default: "",
  },
  technologies: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
projectSchema.pre("save", function (next) {
  if (this.isOngoing) {
    this.endDate = null;
  }
  this.updatedAt = Date.now();
  next();
});

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

    role: {
      type: String,
      enum: ["admin", "candidate", "recruiter"],
      default: "candidate",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    workspaceImages: [workspaceImageSchema],

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

    companySize: {
      type: String,
      default: "",
    },

    foundedYear: {
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

    connectionsCount: {
      type: Number,
      default: 0,
    },

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
    resume: {
      type: String,
      default: "",
    },

    resumeFileName: {
      type: String,
      default: "",
    },

    resumeFileSize: {
      type: Number,
      default: 0,
    },

    websiteUrl: {
      type: String,
      default: "",
    },

    linkedinUrl: {
      type: String,
      default: "",
    },

    instagramUrl: {
      type: String,
      default: "",
    },

    facebookUrl: {
      type: String,
      default: "",
    },

    resetCode: {
      type: String,
      default: null,
    },

    resetCodeExpires: {
      type: Date,
      default: null,
    },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [skillSchema],
    languages: [languageSchema],
    certifications: [certificationSchema],
    projects: [projectSchema],
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

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
