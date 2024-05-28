const { CourseModel } = require("../models/Course");
const asyncHandler = require("../middleware/async");
const Joi = require("joi");
const uploadImage = require("../utils/uploadImage");

const courseSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().valid("video", "book").required(),
  url: Joi.string().required(),
  thumbnail: Joi.alternatives().try(Joi.string(), Joi.object()),
});

const searchSchema = Joi.object({
  keyword: Joi.string().trim().required(),
});

// Create a course
exports.createCourse = asyncHandler(async (req, res, next) => {
  const { error, value } = courseSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  if (typeof value.thumbnail === "object") {
    value.thumbnail = await uploadImage(value.thumbnail);
  }

  const course = await CourseModel.create(value);
  res.status(201).json({ success: true, data: course });
});

// Get all courses
exports.getCourses = asyncHandler(async (req, res, next) => {
  const courses = await CourseModel.find();
  res.status(200).json({ success: true, data: courses });
});

// Get a single course
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await CourseModel.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }
  res.status(200).json({ success: true, data: course });
});

// Update a course
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { error, value } = courseSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  if (typeof value.thumbnail === "object") {
    value.thumbnail = await uploadImage(value.thumbnail);
  }

  const course = await CourseModel.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }

  res.status(200).json({ success: true, data: course });
});

// Delete a course
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await CourseModel.findByIdAndDelete(req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, error: "Course not found" });
  }
  res.status(200).json({ success: true, data: {} });
});

// Search courses dynamically by keyword
exports.searchCourses = asyncHandler(async (req, res, next) => {
  const { error, value } = searchSchema.validate({
    keyword: req.params.keyword,
  });
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  const courses = await CourseModel.find({
    $or: [
      { title: { $regex: value.keyword, $options: "i" } },
      { description: { $regex: value.keyword, $options: "i" } },
    ],
  });

  res.status(200).json({ success: true, data: courses });
});
