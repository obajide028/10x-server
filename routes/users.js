const express = require("express");
const { getUsers, getUser, deleteUser, getUserWithPurchasedCourse } = require("../controllers/user");
const User = require("../models/User");
const advancedResult = require("../middleware/advancedResult");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(advancedResult(User), protect, authorize("admin", "super admin"), getUsers);

router
  .route("/:id")
  .get(protect, authorize("admin", "super admin"), getUser)
  .delete(protect, authorize("admin", "user", "super admin"), deleteUser);

  router 
    .route('/:id/course')
      .get(protect, getUserWithPurchasedCourse)
    

module.exports = router;
