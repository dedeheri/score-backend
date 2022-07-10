const mongoose = require("mongoose");

const task = mongoose.Schema(
  {
    codeScore: {
      type: String,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "studentprofil",
    },
    teacher: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
      default: 0,
    },
    attendance: {
      type: Number,
      required: true,
      default: 0,
    },
    bcOne: {
      type: Number,
      required: true,
      default: 0,
    },
    bcTwo: {
      type: Number,
      required: true,
      default: 0,
    },
    bcThree: {
      type: Number,
      required: true,
      default: 0,
    },
    bcFour: {
      type: Number,
      required: true,
      default: 0,
    },
    midtermExam: {
      type: Number,
      required: true,
      default: 0,
    },
    finalExams: {
      type: Number,
      required: true,
      default: 0,
    },
    avarage: {
      type: Number,
    },
  },
  { timestamps: true }
);

const taskModel = mongoose.model("task", task);
module.exports = taskModel;
