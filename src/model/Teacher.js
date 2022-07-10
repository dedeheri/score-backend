const mongoose = require("mongoose");

const requireValidation = {
  required: true,
  trim: true,
};
const teacherSchema = new mongoose.Schema(
  {
    authId: {
      type: String,
      default: null,
    },
    codeTeacher: {
      ...requireValidation,
      type: String,
    },
    fullName: {
      ...requireValidation,
      type: String,
    },
    email: {
      default: null,
      type: String,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },
    status: {
      ...requireValidation,
      type: String,
    },
    identityNumber: {
      ...requireValidation,
      type: Number,
    },
    schedule: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "schedule",
      },
    ],
  },
  { timestamps: true }
);

const teacher = mongoose.model("teacherProfil", teacherSchema);
module.exports = teacher;
