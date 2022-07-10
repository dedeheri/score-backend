const { validationResult } = require("express-validator");

// model
const teacherModel = require("../model/Teacher");
const studentModel = require("../model/student");
const task = require("../model/task");
const authModel = require("../model/auth/auth");
const taskModel = require("../model/task");
const classRoomModel = require("../model/classRoom");

const getTeacher = async (req, res) => {
  const id = req.user.id;

  const auth = await authModel.findOne({ _id: id });
  const teacher = await teacherModel
    .findOne({ authId: auth._id })
    .populate("address")
    .populate("schedule");

  res.status(200).json({ message: "Success", result: teacher });
};

const getScoring = async (req, res) => {
  // request body
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const filter = req.query.filter;
  const sort = req.query.sort || 1;

  const auth = await authModel.findById({ _id: req.user.id });

  const teacher = await teacherModel
    .findOne({ authId: auth._id })
    .populate("schedule");

  const tasks = await taskModel.find().populate({
    path: "studentId",
    select: ["fullName", "classRoom", "identityNumber"],
  });

  // filter by class
  const filterByName = (name, tasks) => {
    return tasks.filter(({ teacher }) => {
      return teacher.toLowerCase().includes(name.toLowerCase());
    });
  };
  const resultFilterByName = filterByName(teacher.fullName, tasks);

  // filter by query
  const filterByQuery = (filterQuery, sortQuery, data) => {
    if (filterQuery) {
      return data.filter((items) => {
        return Object.values(items.studentId).some(
          (c) => c.classRoom === filterQuery
        );
      });
    }

    if (sortQuery) {
      return data.sort((a, b) => {
        return a.createdAt > b.createdAt ? sortQuery : createdAt;
      });
    }

    return data;
  };

  const resultFilterByQuery = filterByQuery(filter, sort, resultFilterByName);

  // pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const resultPage = {
    current: page,
    total: resultFilterByQuery.length,
    from: startIndex + 1,
    to:
      endIndex > resultFilterByQuery.length
        ? resultFilterByQuery.length
        : endIndex,
  };

  if (endIndex < resultFilterByQuery.length) {
    resultPage.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    resultPage.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  const endResult = resultFilterByQuery.slice(startIndex, endIndex);

  try {
    res.status(200).json({
      message: "Success",
      page: resultPage,
      result: endResult,
    });
  } catch (error) {
    console.log(error);
  }
};

const addTask = async (req, res) => {
  // request body
  const {
    studentName,
    attendance,
    bcOne,
    bcTwo,
    bcThree,
    bcFour,
    midtermExam,
    finalExams,
    course,
  } = req.body;

  const id = req.user.id;
  const auth = await authModel.findOne({ _id: id });
  const teacher = await teacherModel
    .findOne({ authId: auth._id })
    .populate("address")
    .populate("schedule");
  const students = await studentModel.findOne({ fullName: studentName });

  if (!students) return res.status(422).json({ message: "Name not found" });
  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });

  const atte = [parseInt(attendance)];
  const tasks = [
    parseInt(bcOne),
    parseInt(bcTwo),
    parseInt(bcThree),
    parseInt(bcFour),
  ];
  const midterm = [parseInt(midtermExam)];
  const fExam = [parseInt(finalExams)];

  const avarage = (atten, tasks, midterm, fExam) => {
    const result = tasks.reduce((a, b) => a + b) / tasks.length;
    return [atten * 0.1, result * 0.5, midterm * 0.2, fExam * 0.2].reduce(
      (a, b) => a + b
    );
  };

  const avarages = avarage(atte, tasks, midterm, fExam);
  // code
  const count = (await taskModel.find().countDocuments()) + 1;
  try {
    // new data
    const saveTask = new task({
      studentId: students._id,
      codeScore: "CS0" + count,
      teacher: teacher.fullName,
      course,
      attendance,
      bcOne,
      bcTwo,
      bcThree,
      bcFour,
      midtermExam,
      finalExams,
      avarage: avarages,
    });

    const tasks = await saveTask.save();
    await studentModel.updateOne(
      { _id: students._id },
      { $push: { task: tasks } }
    );

    res.status(200).json({
      massage: "Success",
      result: tasks,
    });
  } catch (error) {
    console.log(error);
  }
};

const editScore = async (req, res) => {
  const name = req.query.name;
  const taskId = req.query.taskId;
  const course = req.body.course;
  const attendance = req.body.attendance;
  const bcOne = req.body.bcOne;
  const bcTwo = req.body.bcTwo;
  const bcThree = req.body.bcThree;
  const bcFour = req.body.bcFour;
  const midtermExam = req.body.midtermExam;
  const finalExams = req.body.finalExams;

  // find by id
  const task = await taskModel.findOne({ _id: taskId });
  const student = await studentModel.findOne({ fullName: name });
  if (!task || !student) return res.status(422).json({ message: "Not found" });

  const atte = [parseInt(task.attendance)];
  const tasks = [
    parseInt(task.taskOne),
    parseInt(task.taskTwo),
    parseInt(task.taskThree),
  ];
  const midterm = [parseInt(task.midtermExam)];
  const fExam = [parseInt(task.finalExams)];

  const avarage = (atten, tasks, midterm, fExam) => {
    const result = tasks.reduce((a, b) => a + b) / tasks.length;
    return [atten * 0.1, result * 0.2, midterm * 0.3, fExam * 0.4].reduce(
      (a, b) => a + b
    );
  };

  const avarages = avarage(atte, tasks, midterm, fExam);

  try {
    await taskModel.updateOne(
      { _id: task._id },
      {
        $set: {
          course,
          attendance,
          taskOne,
          taskTwo,
          taskThree,
          midtermExam,
          finalExams,
          avarage: avarages,
        },
      }
    );

    res.status(200).json({ message: "Success", result: task });
  } catch (error) {
    console.log(error);
  }
};

const getInformationStudent = async (req, res) => {
  const classRooms = await classRoomModel.find();
  const student = await studentModel.find().populate("task");

  try {
    res.status(200).json({
      message: "Success",
      result: {
        info: student,
        classRoom: classRooms,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const getDetailScore = async (req, res) => {
  const studentId = req.query.studentId;
  const taskId = req.query.taskId;

  // get data from database
  const student = await studentModel.findById({ _id: studentId });
  const task = await taskModel.findById({ _id: taskId });

  // not found
  if (!student || !task)
    return res.status(404).json({ message: "Data Not Found" });

  try {
    return res.status(200).json({
      message: "Success",
      result: {
        student: {
          codeStudent: student.codeStudent,
          identityNumber: student.identityNumber,
          classRoom: student.classRoom,
          fullName: student.fullName,
        },
        task,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Something Wrong" });
  }
};

module.exports = {
  getInformationStudent,
  getTeacher,
  getScoring,
  addTask,
  editScore,
  getDetailScore,
};
