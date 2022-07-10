const teacherModel = require("../model/Teacher");
const studentModel = require("../model/student");
const authModel = require("../model/auth/auth");

const getStudent = async (req, res) => {
  const auth = await authModel.findById({ _id: req.user.id });

  const student = await studentModel
    .findOne({ authId: auth._id })
    .populate("task")
    .populate("address");
  const teacher = await teacherModel.find().populate("schedule");

  // get course
  try {
    const getCourseInTeacherData = (data, classRoom) => {
      const arr = [];
      for (let i in data) {
        for (let b in data[i].schedule) {
          Object.values(data[i].schedule[b])?.filter((c) => {
            if (c.classRoom == classRoom) {
              arr.push({ teacherName: data[i].fullName, schedule: c });
            }
          });
        }
      }

      return arr;
    };
    const result = getCourseInTeacherData(teacher, student.classRoom);
    res.status(200).json({
      message: "Succes",
      result: {
        fullName: student.fullName,
        data: result,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};

const getScore = async (req, res) => {
  const student = await studentModel
    .findOne({ authId: req.user.id })
    .populate("task");
  try {
    if (!student) return res.status(422).json({ message: "Task Not found" });
    res.status(200).json({ message: "Succes", result: student });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};

const getUserStudent = async (req, res) => {
  const id = req.user.id;
  const auth = await authModel.findOne({ _id: id });
  const student = await studentModel
    .findOne({ authId: auth._id })
    .populate("task");

  if (!student)
    return res.status(404).json({ message: "Siswa tidak dapat ditemukan" });

  try {
    return res.status(200).json({ message: "Success", result: student });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};
module.exports = {
  getStudent,
  getUserStudent,
  getScore,
};
