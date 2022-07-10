const mongoose = require("mongoose");

const validation = {
  required: true,
  trim: true,
};
const students = new mongoose.Schema(
  {
    authId: {
      type: String,
      default: null,
    },
    codeStudent: {
      ...validation,
      type: String,
    },
    fullName: {
      ...validation,
      type: String,
    },
    email: {
      default: null,
      type: String,
    },
    identityNumber: {
      ...validation,
      type: Number,
    },
    classRoom: {
      ...validation,
      type: String,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },
    task: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
      },
    ],
  },

  { timestamps: true }
);

const studentModel = mongoose.model("studentprofil", students);
module.exports = studentModel;
