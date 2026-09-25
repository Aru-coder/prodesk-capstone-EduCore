const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const Course = require("./models/Course");
const User = require("./models/User");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "EduCore Enterprise LMS REST API - Feature Complete (Sprint 15)",
    version: "1.0.0",
    status: "Active",
  });
});

// Seed sample data if DB is empty
const seedInitialData = async () => {
  try {
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      // Find or create default admin/instructor user
      let admin = await User.findOne({ email: "admin@educore.com" });
      if (!admin) {
        admin = await User.create({
          name: "Dr. Sarah Jenkins",
          email: "admin@educore.com",
          password: "$2a$10$e.w0R1QcI/dE2/6v0X81e.GZ4z.gS/v.xG/1G/X1", // placeholder hash
          role: "instructor",
        });
      }

      await Course.create([
        {
          title: "Full-Stack Web Development Bootcamp",
          description: "Master React, Node.js, Express, and MongoDB from scratch to production deployment.",
          category: "Development",
          level: "Beginner",
          price: 49.99,
          instructorId: admin._id,
          instructorName: admin.name,
          status: "published",
          thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
          lessons: [
            { title: "HTML5 & Modern CSS Layouts", content: "Learn Flexbox & CSS Grid.", duration: "15 mins", order: 1 },
            { title: "JavaScript Fundamentals & Async/Await", content: "Understand ES6+ features.", duration: "25 mins", order: 2 },
            { title: "Building REST APIs with Express & Mongoose", content: "Create routes & JWT auth.", duration: "40 mins", order: 3 },
          ],
        },
        {
          title: "Enterprise Data Structures & Algorithms",
          description: "Comprehensive guide to Big-O notation, trees, graphs, dynamic programming, and system design interviews.",
          category: "Computer Science",
          level: "Advanced",
          price: 79.99,
          instructorId: admin._id,
          instructorName: admin.name,
          status: "published",
          thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
          lessons: [
            { title: "Time & Space Complexity Analysis", content: "Analyzing Big-O notation.", duration: "20 mins", order: 1 },
            { title: "Trees, Graphs & Traversal Algorithms", content: "BFS and DFS implementations.", duration: "35 mins", order: 2 },
          ],
        },
        {
          title: "UI/UX Masterclass for Modern Web Apps",
          description: "Learn color theory, micro-interactions, responsive design systems, and Figma component libraries.",
          category: "Design",
          level: "Intermediate",
          price: 29.99,
          instructorId: admin._id,
          instructorName: admin.name,
          status: "published",
          thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
          lessons: [
            { title: "Principles of Visual Hierarchy", content: "Spacing, typography, and contrast.", duration: "18 mins", order: 1 },
            { title: "Design Systems & Glassmorphism UI", content: "Creating reusable CSS tokens.", duration: "30 mins", order: 2 },
          ],
        },
      ]);
      console.log("Initial sample courses seeded successfully!");
    }
  } catch (err) {
    console.error("Error seeding initial data:", err.message);
  }
};

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/educore_db";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    seedInitialData();
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});