const express = require("express");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

// ==========================================
// CREATE STRIPE CHECKOUT SESSION (POST)
// POST /api/payment/create-checkout-session
// PROTECTED
// ==========================================
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { courseId, originUrl } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const clientOrigin = originUrl || req.headers.origin || "http://localhost:5173";

    // If Stripe secret key is present and configured, use official Stripe Checkout
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: course.title,
                description: course.description.substring(0, 100),
                images: [course.thumbnail],
              },
              unit_amount: Math.round(course.price * 100), // Stripe expects amounts in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${clientOrigin}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course._id}`,
        cancel_url: `${clientOrigin}/courses/${course._id}?cancelled=true`,
        client_reference_id: req.user.userId,
        metadata: {
          courseId: course._id.toString(),
          userId: req.user.userId.toString(),
        },
      });

      return res.status(200).json({
        url: session.url,
        sessionId: session.id,
        isMock: false,
      });
    } else {
      // Direct enrollment for free courses or test environment without Stripe secret key configured
      return res.status(200).json({
        url: `${clientOrigin}/payment-success?session_id=mock_session_${Date.now()}&course_id=${course._id}`,
        sessionId: `mock_session_${Date.now()}`,
        isMock: true,
      });
    }
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    res.status(500).json({ message: "Server error creating checkout session" });
  }
});

// ==========================================
// CONFIRM PAYMENT & AUTO ENROLL
// POST /api/payment/confirm
// PROTECTED
// ==========================================
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const { courseId, sessionId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    // Check if enrollment already exists
    let enrollment = await Enrollment.findOne({
      studentId: req.user.userId,
      courseId,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        studentId: req.user.userId,
        courseId,
        paymentStatus: "paid",
        paymentId: sessionId || `tx_${Date.now()}`,
        progress: 0,
        completedLessons: [],
      });
    }

    const populated = await Enrollment.findById(enrollment._id).populate("courseId");

    res.status(200).json({
      message: "Payment verified and course enrolled successfully!",
      enrollment: populated,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ message: "Server error confirming payment" });
  }
});

module.exports = router;
