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
  if (req.user.role !== "admin" && req.user.role !== "super admin") {
    return res.status(401).json({
      success: false,
      message: `User ${req.user.id} is not authorized to add course`,
    });
  }
  const { error, value } = courseSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  // Handle thumbnail upload
  let thumbnailUrl;
  if (req.files && req.files.thumbnail) {
    thumbnailUrl = await uploadImage(req.files.thumbnail.tempFilePath);
  } else {
    return res.status(400).json({ error: "Thumbnail file not provided" });
  }

  const course = await CourseModel.create({
    ...value,
    thumbnail: thumbnailUrl,
  });

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
  if (req.user.role !== "admin" && req.user.role !== "super admin") {
    return res.status(401).json({
      success: false,
      message: `User ${req.user.id} is not authorized to update a course`,
    });
  }

  const { error, value } = courseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  // Find the existing course to retain existing thumbnail if no new one is provided
  const existingCourse = await CourseModel.findById(req.params.id);
  if (!existingCourse) {
    return res.status(404).json({ success: false, error: 'Course not found' });
  }

  // Handle thumbnail upload if a new thumbnail is provided
  if (req.files && req.files.thumbnail) {
    value.thumbnail = await uploadImage(req.files.thumbnail.tempFilePath);
  } else {
    value.thumbnail = existingCourse.thumbnail; // Retain the existing thumbnail
  }

  const course = await CourseModel.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});


// Delete a course
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super admin") {
    return res.status(401).json({
      success: false,
      message: `User ${req.user.id} is not authorized to delete a course`,
    });
  }

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
