const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courses");
const { authorize, protect } = require("../middleware/auth");

// Create a course
router.post(
  "/",
  protect,
  authorize("admin", "super admin"),
  courseController.createCourse
);

// Update a course
router.put(
  "/:id",
  protect,
  authorize("admin", "super admin"),
  courseController.updateCourse
);
// Delete a course
router.delete(
  "/:id",
  protect,
  authorize("admin", "super admin"),
  courseController.deleteCourse
);
// Get all courses
router.get("/", courseController.getCourses);

// Get a single course
router.get("/:id", courseController.getCourse);

// Search courses dynamically by keyword
router.get("/search/:keyword", courseController.searchCourses);

module.exports = router;
