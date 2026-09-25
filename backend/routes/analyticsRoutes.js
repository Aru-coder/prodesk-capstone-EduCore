const express = require("express");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET DASHBOARD ANALYTICS
// GET /api/analytics/dashboard
// PROTECTED
// ==========================================
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalEnrollments = await Enrollment.countDocuments();

    // Fetch all courses for category analytics
    const courses = await Course.find();
    const enrollments = await Enrollment.find().populate("courseId");

    // Aggregate courses by category
    const categoryCounts = courses.reduce((acc, c) => {
      const cat = c.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.keys(categoryCounts).map((cat) => ({
      category: cat,
      count: categoryCounts[cat],
    }));

    // Calculate total revenue from paid enrollments
    const revenue = enrollments.reduce((sum, en) => {
      if (en.courseId && en.courseId.price) {
        return sum + en.courseId.price;
      }
      return sum;
    }, 0);

    // Recent activity metrics
    const recentEnrollments = await Enrollment.find()
      .populate("studentId", "name email")
      .populate("courseId", "title price")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      metrics: {
        totalCourses,
        totalStudents,
        totalEnrollments,
        totalRevenue: revenue,
      },
      categoryData,
      recentEnrollments,
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
});

module.exports = router;
