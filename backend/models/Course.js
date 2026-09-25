const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  videoUrl: {
    type: String,
    default: "",
  },
  duration: {
    type: String,
    default: "10 mins",
  },
  order: {
    type: Number,
    default: 1,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "Development",
      trim: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorName: {
      type: String,
      default: "Instructor",
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "published"],
      default: "published",
    },
    thumbnail: {
      type: String,
      default: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    },
    lessons: [lessonSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);
