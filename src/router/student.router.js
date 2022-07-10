const express = require("express");
const {
  getStudent,
  getScore,
  getUserStudent,
} = require("../controller/student.contoller");
const authorization = require("../middleware/auth");
const { authority } = require("../middleware/role");
const confirmAccount = require("../middleware/confrim");
const router = express.Router();

router.get(
  "/student",
  authorization,
  authority("Student"),
  confirmAccount,
  getStudent
);
router.get(
  "/student/user",
  authorization,
  authority("Student"),
  confirmAccount,
  getUserStudent
);
router.get(
  "/student/score",
  authorization,
  authority("Student"),
  confirmAccount,
  getScore
);
module.exports = router;
