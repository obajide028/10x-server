const mongoose = require("mongoose");

// Define Course Schema
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please add a course title"],
    },
    description: {
      type: String,
      required: [true, "Please add a course description"],
    },
    price: {
      type: String,
      required: [true, "Please add a tuition cost"],
    },
    category: {
      type: String,
      enum: ["video", "book"],
      required: [true, "Please add a category"],
    },
    url: {
      type: String,
      required: [false, "Please add a valid URL"],
    },
    thumbnail: {
      type: String,
      required: [true, "Add an image"],
      default: "no-photo.jpg",
    },
    status: {
      type: String,
      enum: ["drafted", "published"],
      default: "published",
    },
  },
  { timestamps: true }
);

const CourseModel = mongoose.model("Course", courseSchema);

module.exports = { CourseModel };
