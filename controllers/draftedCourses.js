const { DraftedCourseModel } = require("../models/draftedCourse");
const asyncHandler = require("../middleware/async");
const Joi = require("joi");
const uploadImage = require("../utils/uploadImage");

const courseSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().valid("video", "book").required(),
  url: Joi.string().required(),
  thumbnail: Joi.string(),
});

const searchSchema = Joi.object({
  keyword: Joi.string().trim().required(),
});

// Create a drafted course
exports.createDraftedCourse = asyncHandler(async (req, res, next) => {
  const { error, value } = courseSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  if (req.body.thumbnail && typeof req.body.thumbnail === "object") {
    value.thumbnail = await uploadImage(req.body.thumbnail);
  }

  const draftedCourse = await DraftedCourseModel.create(value);
  res.status(201).json({ success: true, data: draftedCourse });
});

// Get all drafted courses
exports.getDraftedCourses = asyncHandler(async (req, res, next) => {
  const draftedCourses = await DraftedCourseModel.find();
  res.status(200).json({ success: true, data: draftedCourses });
});

// Get a single drafted course
exports.getDraftedCourse = asyncHandler(async (req, res, next) => {
  const draftedCourse = await DraftedCourseModel.findById(req.params.id);
  if (!draftedCourse) {
    return res
      .status(404)
      .json({ success: false, error: "Drafted course not found" });
  }
  res.status(200).json({ success: true, data: draftedCourse });
});

// Update a drafted course
exports.updateDraftedCourse = asyncHandler(async (req, res, next) => {
  const { error, value } = courseSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  if (req.body.thumbnail && typeof req.body.thumbnail === "object") {
    value.thumbnail = await uploadImage(req.body.thumbnail);
  }

  const draftedCourse = await DraftedCourseModel.findByIdAndUpdate(
    req.params.id,
    value,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!draftedCourse) {
    return res
      .status(404)
      .json({ success: false, error: "Drafted course not found" });
  }

  res.status(200).json({ success: true, data: draftedCourse });
});

// Delete a drafted course
exports.deleteDraftedCourse = asyncHandler(async (req, res, next) => {
  const draftedCourse = await DraftedCourseModel.findByIdAndDelete(
    req.params.id
  );
  if (!draftedCourse) {
    return res
      .status(404)
      .json({ success: false, error: "Drafted course not found" });
  }
  res.status(200).json({ success: true, data: {} });
});

// Search drafted courses dynamically by keyword
exports.searchDraftedCourses = asyncHandler(async (req, res, next) => {
  const { error, value } = searchSchema.validate({
    keyword: req.params.keyword,
  });
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  const draftedCourses = await DraftedCourseModel.find({
    $or: [
      { title: { $regex: value.keyword, $options: "i" } },
      { description: { $regex: value.keyword, $options: "i" } },
    ],
  });

  res.status(200).json({ success: true, data: draftedCourses });
});
