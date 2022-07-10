const express = require("express");
const {
  getTeacher,
  getScoring,
  addTask,
  editScore,
  getInformationStudent,
  getDetailScore,
} = require("../controller/teacher.contoller");
const authorization = require("../middleware/auth");
const confirmAccount = require("../middleware/confrim");
const { authority } = require("../middleware/role");
const validate = require("../validation/formValidation");
const router = express.Router();

router.get(
  "/teacher",
  authorization,
  authority("Teacher"),
  confirmAccount,
  getTeacher
);
router.get(
  "/teacher/score",
  authorization,
  authority("Teacher"),
  confirmAccount,
  getScoring
);
router.post(
  "/teacher/score/add-score",
  authorization,
  authority("Teacher"),
  confirmAccount,
  validate("ADD_TASK"),
  addTask
);
router.put(
  "/teacher/score/",
  authorization,
  authority("Teacher"),
  confirmAccount,
  editScore
);

router.get(
  "/teacher/score/detail",
  authorization,
  authority("Teacher"),
  confirmAccount,
  getDetailScore
);

router.get(
  "/teacher/informationstudent",
  authorization,
  authority("Teacher"),
  confirmAccount,
  getInformationStudent
);

module.exports = router;
