const express = require("express");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// 1. GET MY ENROLLMENTS
// GET /api/enrollments/my
// PROTECTED
// ==========================================
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.userId })
      .populate({
        path: "courseId",
        populate: { path: "instructorId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error("Get my enrollments error:", error);
    res.status(500).json({ message: "Server error fetching enrollments" });
  }
});

// ==========================================
// 2. ENROLL IN A COURSE (POST)
// POST /api/enrollments
// PROTECTED
// ==========================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { courseId, paymentStatus, paymentId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user.userId,
      courseId,
    });

    if (existingEnrollment) {
      return res.status(409).json({ message: "You are already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      studentId: req.user.userId,
      courseId,
      paymentStatus: paymentStatus || (course.price > 0 ? "paid" : "free"),
      paymentId: paymentId || null,
      progress: 0,
      completedLessons: [],
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id).populate({
      path: "courseId",
      populate: { path: "instructorId", select: "name email" },
    });

    res.status(201).json({
      message: "Enrolled successfully!",
      enrollment: populatedEnrollment,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({ message: "Server error enrolling in course" });
  }
});

// ==========================================
// 3. UPDATE LESSON PROGRESS
// PUT /api/enrollments/:id/progress
// PROTECTED WITH OWNERSHIP VALIDATION
// ==========================================
router.put("/:id/progress", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { lessonId, isCompleted } = req.body;

    const enrollment = await Enrollment.findById(id).populate("courseId");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment record not found" });
    }

    // OWNERSHIP VALIDATION
    if (enrollment.studentId.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "403 Forbidden: You do not have permission to modify this enrollment",
      });
    }

    let updatedCompleted = [...enrollment.completedLessons];

    if (isCompleted && !updatedCompleted.includes(lessonId)) {
      updatedCompleted.push(lessonId);
    } else if (!isCompleted) {
      updatedCompleted = updatedCompleted.filter((lId) => lId !== lessonId);
    }

    const totalLessons = enrollment.courseId?.lessons?.length || 1;
    const calculatedProgress = Math.min(
      100,
      Math.round((updatedCompleted.length / totalLessons) * 100)
    );

    enrollment.completedLessons = updatedCompleted;
    enrollment.progress = calculatedProgress;

    await enrollment.save();

    res.status(200).json({
      message: "Progress updated successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: "Server error updating progress" });
  }
});

// ==========================================
// 4. UNENROLL / DELETE ENROLLMENT
// DELETE /api/enrollments/:id
// PROTECTED WITH OWNERSHIP VALIDATION
// ==========================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // OWNERSHIP VALIDATION
    const isOwner = enrollment.studentId.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "403 Forbidden: You do not have permission to delete this enrollment",
      });
    }

    await Enrollment.findByIdAndDelete(id);

    res.status(200).json({
      message: "Unenrolled successfully",
      id,
    });
  } catch (error) {
    console.error("Unenroll error:", error);
    res.status(500).json({ message: "Server error unenrolling from course" });
  }
});

module.exports = router;
