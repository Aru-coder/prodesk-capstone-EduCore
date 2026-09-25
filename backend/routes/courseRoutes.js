const express = require("express");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// 1. GET ALL COURSES (Public / Filtered)
// GET /api/courses
// ==========================================
router.get("/", async (req, res) => {
  try {
    const { category, level, search, status } = req.query;
    let query = {};

    // Filter by status (default to published for general browsing)
    if (status) {
      query.status = status;
    } else {
      query.status = "published";
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (level && level !== "All") {
      query.level = level;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const courses = await Course.find(query)
      .populate("instructorId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ message: "Server error fetching courses" });
  }
});

// ==========================================
// 2. GET MY INSTRUCTOR COURSES
// GET /api/courses/instructor/my
// PROTECTED
// ==========================================
router.get("/instructor/my", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.user.userId })
      .sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    console.error("Get instructor courses error:", error);
    res.status(500).json({ message: "Server error fetching instructor courses" });
  }
});

// ==========================================
// 3. GET SINGLE COURSE BY ID
// GET /api/courses/:id
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Course ID format" });
    }

    const course = await Course.findById(id).populate("instructorId", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Get course by ID error:", error);
    res.status(500).json({ message: "Server error fetching course details" });
  }
});

// ==========================================
// 4. CREATE A NEW COURSE (POST)
// POST /api/courses
// PROTECTED (Instructor / Admin)
// ==========================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, category, level, price, thumbnail, status, lessons } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newCourse = await Course.create({
      title: title.trim(),
      description: description.trim(),
      category: category || "Development",
      level: level || "Beginner",
      price: price ? Number(price) : 0,
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
      status: status || "published",
      instructorId: req.user.userId,
      instructorName: req.user.name || "Instructor",
      lessons: lessons && Array.isArray(lessons) ? lessons : [],
    });

    res.status(201).json({
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ message: "Server error creating course" });
  }
});

// ==========================================
// 5. UPDATE A COURSE (PUT / PATCH)
// PUT /api/courses/:id
// PROTECTED WITH OWNERSHIP VALIDATION
// ==========================================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Course ID format" });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // DATA OWNERSHIP VALIDATION (Critical Sprint Requirement)
    // Only the instructor who created the course or an admin can update it
    const isOwner = course.instructorId.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "403 Forbidden: You do not have permission to modify this course",
      });
    }

    const { title, description, category, level, price, thumbnail, status, lessons } = req.body;

    if (title) course.title = title.trim();
    if (description) course.description = description.trim();
    if (category) course.category = category;
    if (level) course.level = level;
    if (price !== undefined) course.price = Number(price);
    if (thumbnail) course.thumbnail = thumbnail;
    if (status) course.status = status;
    if (lessons && Array.isArray(lessons)) course.lessons = lessons;

    const updatedCourse = await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ message: "Server error updating course" });
  }
});

// ==========================================
// 6. DELETE A COURSE (DELETE)
// DELETE /api/courses/:id
// PROTECTED WITH OWNERSHIP VALIDATION
// ==========================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Course ID format" });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // DATA OWNERSHIP VALIDATION (Critical Sprint Requirement)
    const isOwner = course.instructorId.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "403 Forbidden: You do not have permission to delete this course",
      });
    }

    await Course.findByIdAndDelete(id);

    // Clean up associated enrollments
    await Enrollment.deleteMany({ courseId: id });

    res.status(200).json({
      message: "Course and related enrollments deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ message: "Server error deleting course" });
  }
});

// ==========================================
// 7. ADD LESSON TO COURSE
// POST /api/courses/:id/lessons
// PROTECTED WITH OWNERSHIP VALIDATION
// ==========================================
router.post("/:id/lessons", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Ownership check
    const isOwner = course.instructorId.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "403 Forbidden: You do not have permission to modify this course",
      });
    }

    const { title, content, videoUrl, duration } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Lesson title is required" });
    }

    const newLesson = {
      title,
      content: content || "",
      videoUrl: videoUrl || "",
      duration: duration || "10 mins",
      order: course.lessons.length + 1,
    };

    course.lessons.push(newLesson);
    await course.save();

    res.status(201).json({
      message: "Lesson added successfully",
      course,
    });
  } catch (error) {
    console.error("Add lesson error:", error);
    res.status(500).json({ message: "Server error adding lesson" });
  }
});

module.exports = router;
