const mongoose = require("mongoose");

const schedule = mongoose.Schema(
  {
    codeClass: {
      type: String,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacherProfil",
    },
    course: {
      type: String,
      required: true,
    },
    classRoom: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const scheduleModel = mongoose.model("schedule", schedule);
module.exports = scheduleModel;
