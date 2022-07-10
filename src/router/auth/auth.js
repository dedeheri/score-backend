const express = require("express");
const router = express.Router();
const {
  signUpStaff,
  signUpTeacher,
  signIn,
  signUpStudent,
  verifyTeacher,
  verifyStudent,
  forget,
} = require("../../controller/auth/auth");
const validate = require("../../validation/formValidation");

router.post("/signup/staff", validate("SIGNUP_STAFF"), signUpStaff);
router.post("/signup/teacher", verifyTeacher);
router.post("/signup/teacher/next", signUpTeacher);
router.post("/signup/student", verifyStudent);
router.post("/signup/student/next", validate("PASSWORD"), signUpStudent);
router.post("/signin", signIn);
router.post("/forget", validate("FORGET"), forget);

module.exports = router;
