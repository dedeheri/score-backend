const mongoose = require("mongoose");
const classRoom = mongoose.Schema(
  {
    codeClass: {
      type: String,
      required: true,
    },
    classRoom: {
      type: String,
      required: true,
    },
    homeRoomTeacher: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const clr = mongoose.model("classRoom", classRoom);
module.exports = clr;
