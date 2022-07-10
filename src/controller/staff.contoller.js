const scheduleModel = require("../model/schedule");
const studentModel = require("../model/student");
const teacherModels = require("../model/Teacher");
const taskModel = require("../model/task");
const staffModel = require("../model/staff");
const streetModel = require("../model/street");
const authModel = require("../model/auth/auth");
const classRoomModel = require("../model/classRoom");

const { validationResult } = require("express-validator");

const getStaff = async (req, res) => {
  const staff = await staffModel
    .findOne({ authId: req.user.id })
    .populate("address");
  try {
    res.status(200).json({
      message: "Success",
      result: staff,
    });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};

const getAllData = async (req, res) => {
  const id = req.user.id;

  // count
  const scheduleCounts = await scheduleModel.find().countDocuments();
  const taskCounts = await taskModel.find().countDocuments();
  const teacherCounts = await teacherModels.find().countDocuments();
  const staffCounts = await staffModel.find().countDocuments();
  const studentCounts = await studentModel.find().countDocuments();
  const auth = await authModel.findOne({ _id: id });
  const classRoom = await classRoomModel.find().countDocuments();
  const staff = await staffModel.find({ authId: auth._id }).populate("address");
  const teachers = await teacherModels
    .find()
    .populate({ path: "schedule" })
    .populate({ path: "address" });

  // filter perday
  const todayFun = (teachers, staff) => {
    const getDay = new Date();
    const option = { weekday: "long" };
    const today = new Intl.DateTimeFormat("in", option).format(getDay);
    teachers.map((items) => {
      items.schedule = items.schedule.filter((c) =>
        today.toUpperCase().includes(c.day)
      );
      return items;
    });
  };

  todayFun(teachers, staff);

  try {
    res.status(200).json({
      message: "Success",
      countSchedule: scheduleCounts,
      countTask: taskCounts,
      countTeacher: teacherCounts,
      countStaff: staffCounts,
      countStudents: studentCounts,
      countClass: classRoom,
      result: teachers,
    });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};

const confirmAccount = async (req, res) => {
  const id = req.params.id;
  const confirmation = req.body.confirmation;

  console.log(id);

  try {
    const getId = await authModel.findById(id);
    if (!getId) {
      res.status(422).json({ message: "Id Not Found" });
    }

    await authModel.updateOne(
      { _id: id },
      { accountConfirmation: confirmation },
      { new: true }
    );
    return res.status(200).json({
      message: "Success",
      result: getId,
    });
  } catch (error) {
    res.status(422).json({ message: "something wrong" });
    console.log(error);
  }
};

const addSchedule = async (req, res) => {
  const { teacherName, course, day, time, classRoom } = req.body;
  const teacherId = await teacherModels.findOne({ fullName: teacherName });

  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  // find classrom
  const classRoomMatch = await classRoomModel.findOne({ classRoom: classRoom });
  if (!classRoomMatch)
    return res.status(422).json({ message: "Class room not found" });

  // increment
  const count = (await scheduleModel.find().countDocuments()) + 1;

  // replace regex
  const days = (s) => s.replace(/./, (c) => c.toUpperCase());
  const courses = (s) => s.replace(/./, (c) => c.toUpperCase());

  const dayCappital = days(day);
  const courseCappital = courses(course);

  if (!teacherId) {
    return res.status(401).json({
      message: "Name not found",
    });
  }

  try {
    const shedule = new scheduleModel({
      codeClass: "KJ0" + count,
      teacherId: teacherId._id,
      course: courseCappital,
      classRoom: classRoomMatch.classRoom,
      day: dayCappital,
      time,
    });

    const saveShedule = await shedule.save();
    await teacherModels.updateOne(
      { _id: teacherId._id },
      { $push: { schedule: saveShedule } }
    );

    res.status(200).json({
      message: "Succes",
      result: saveShedule,
    });
  } catch (error) {
    console.log(error);
  }
};

const viewSchedule = async (req, res) => {
  const filter = req.query.filter; // asd , desc
  const sort = req.query.sort; // Sort By Class and Day

  // pagination
  const limit = parseInt(req.query.limit) || 15;
  const page = parseInt(req.query.page) || 1;

  const schedule = await scheduleModel.find().populate({
    path: "teacherId",
    select: "fullName",
  });

  const sortAndFilter = (filterQuery, sortQuery, dataSchedule) => {
    if (filterQuery) {
      return dataSchedule.filter(({ classRoom }) => {
        return classRoom.toLowerCase().includes(filterQuery.toLowerCase());
      });
    }

    if (sortQuery) {
      return dataSchedule.sort((a, b) => {
        return a.createdAt > b.createdAt ? sortQuery : sortQuery;
      });
    }
    return dataSchedule;
  };

  const data = sortAndFilter(filter, sort, schedule);
  const total = data.length;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const resultPage = {
    current: page,
    total: total,
    from: startIndex + 1,
    to: endIndex > total ? total : endIndex,
  };

  if (endIndex < total) {
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

  const resultSlice = data.slice(startIndex, endIndex);

  try {
    res.status(200).json({
      message: "Success",
      page: resultPage,
      result: resultSlice,
    });
  } catch (error) {
    console.log(error);
  }
};

const editSchedule = async (req, res) => {
  const scheduleId = req.query.scheduleId;
  const course = req.body.course;
  const classRoom = req.body.classRoom;
  const day = req.body.day;
  const time = req.body.time;

  // error
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ message: errors.array() });
  try {
    const schedule = await scheduleModel.findByIdAndUpdate(
      { _id: scheduleId },
      { course: course, classRoom: classRoom, day: day, time: time }
    );
    if (!schedule) return res.status(300).json("not found");

    res.status(200).json({ message: "Success", result: schedule });
  } catch (error) {
    res.status(200).json({ message: "Id not found" });
    console.log(error);
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const id = req.params.id;
    const schedule = await scheduleModel.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(401).json({ message: `No data for id : ${id}` });
    }

    return res
      .status(200)
      .json({ message: "Success", result: `Id ${id} deleted` });
  } catch (error) {
    res.status(401).json({ message: "Id not found" });
    console.log(error);
  }
};

const viewTeacher = async (req, res) => {
  const sortQuery = req.query.sort;

  const limit = parseInt(req.query.limit) || 15;
  const page = parseInt(req.query.page) || 1;

  const teacher = await teacherModels
    .find()
    .sort({ createdAt: -1 })
    .populate("schedule")
    .populate("address");

  const sortBy = (teachers, sortQuery) => {
    if (sortQuery) {
      teachers.sort((a, b) => {
        return a.fullName.toLowerCase() < b.fullName.toLowerCase()
          ? sortQuery
          : sortQuery;
      });
    }

    return teachers;
  };

  const resultSort = sortBy(teacher, sortQuery);

  // pagination
  const total = resultSort.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const resultPage = {
    current: page,
    total: total,
    from: page,
    to: endIndex > total ? total : endIndex,
  };

  if (endIndex < total) {
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

  const resultPagination = resultSort.slice(startIndex, endIndex);

  try {
    return res
      .status(200)
      .json({ message: "Success", page: resultPage, result: resultPagination });
  } catch (error) {
    console.log(error);
  }
};

const detailTeacher = async (req, res) => {
  try {
    const name = req.query.fullName;
    const tId = req.query.teacherId;

    const data = await teacherModels
      .findOne({ _id: tId, fullName: name })
      .populate("schedule")
      .populate("address");

    if (!data) return res.status(422).json({ message: "data not found" });

    res.status(200).json({ massage: "Success", result: data });
  } catch (error) {
    console.log(error);
    res.status(422).json({ message: "Id not found" });
  }
};

const viewStudent = async (req, res) => {
  const sort = req.query.sort;
  const filter = req.query.filter;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;

  const student = await studentModel
    .find()
    .sort({ createdAt: -1 })
    .populate("address")
    .populate("task");

  const filtered = (sortQuery, students, filterQuery) => {
    if (filterQuery) {
      return students.filter((fi) => fi.classRoom === filterQuery);
    }

    if (sortQuery) {
      return students.sort((a, b) =>
        a.fullName.toLowerCase() > b.fullName.toLowerCase()
          ? sortQuery
          : sortQuery
      );
    }

    return students;
  };

  const resultFilter = filtered(sort, student, filter);

  // pagination
  const total = resultFilter.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const resultPage = {
    current: page,
    total: total,
    from: page,
    to: endIndex > total ? total : endIndex,
  };

  if (endIndex < total) {
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

  const resultPagination = resultFilter.slice(startIndex, endIndex);

  try {
    res
      .status(200)
      .json({ message: "Success", page: resultPage, result: resultPagination });
  } catch (error) {
    console.log(error);
  }
};

const detailStudent = async (req, res) => {
  const studentId = req.query.studentId;
  const fullName = req.query.fullName;
  try {
    const student = await studentModel
      .findOne({ _id: studentId, fullName: fullName })
      .populate("address")
      .populate("task");

    if (!student) return res.status(422).json({ message: "Not Found" });
    res.status(200).json({ message: "Success", result: student });
  } catch (error) {
    console.log(error);
  }
};

const addTeacher = async (req, res) => {
  const fullName = req.body.fullName;
  const status = req.body.status;
  const identityNumber = req.body.identityNumber;
  const province = req.body.province;
  const city = req.body.city;
  const street = req.body.street;
  const postelCode = req.body.postelCode;

  // code
  const count = (await teacherModels.find().countDocuments()) + 1;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  //   cek identityNumber
  const checkIdentityNumber = await teacherModels.findOne({
    identityNumber: identityNumber,
  });

  if (checkIdentityNumber) {
    return res.status(422).json({
      message: `Teacher with Indentity number ${identityNumber} already exsist`,
    });
  }

  try {
    const streets = new streetModel({
      province,
      city,
      street,
      postelCode,
    });

    const teachers = new teacherModels({
      fullName,
      codeTeacher: "CT0" + count,
      address: streets._id,
      status,
      identityNumber,
    });

    const saveTeacher = await teachers.save();
    await streets.save();

    res.status(200).json({ message: "Success", result: saveTeacher });
  } catch (error) {
    console.log(error);
  }
};

const addStudent = async (req, res) => {
  const fullName = req.body.fullName;
  const identityNumber = req.body.identityNumber;
  const classRoom = req.body.classRoom;
  const province = req.body.province;
  const city = req.body.city;
  const street = req.body.street;
  const postelCode = req.body.postelCode;

  // error reqbody
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // class Room
  const classR = await classRoomModel.findOne({ classRoom });
  if (!classR) return res.status(422).json({ message: "Class Room not found" });
  // count
  const count = (await studentModel.find().countDocuments()) + 1;

  // cek indentity number
  const checkIdentityNumber = await studentModel.findOne({
    identityNumber: identityNumber,
  });
  if (checkIdentityNumber) {
    return res.status(422).json({
      message: `Student with Indentity number ${identityNumber} already exsist`,
    });
  }

  // callback
  try {
    const newStreet = new streetModel({
      province,
      city,
      street,
      postelCode,
    });
    const newStudent = new studentModel({
      codeStudent: "CS0" + count,
      fullName,
      identityNumber,
      classRoom,
      address: newStreet._id,
    });

    // save to database
    await newStreet.save();
    const data = await newStudent.save();
    res.status(200).json({ message: "Success", result: data });
  } catch (error) {
    console.log(error);
  }
};

const editStudent = async (req, res) => {
  const studentId = req.query.studentId;
  const fullNameQuery = req.query.fullName;

  const fullName = req.body.fullName;
  const classRoom = req.body.classRoom;
  const identityNumber = req.body.identityNumber;
  const street = req.body.street;
  const city = req.body.city;
  const province = req.body.province;
  const postelCode = req.body.postelCode;

  const student = await studentModel.findOne({
    _id: studentId,
    fullName: fullNameQuery,
  });

  // not found
  if (!student) return res.status(404).json({ message: "Data not found" });
  // form validation
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
  try {
    await studentModel.findByIdAndUpdate(
      {
        _id: student._id,
      },
      {
        fullName,
        classRoom,
        identityNumber,
      }
    );

    await streetModel.findByIdAndUpdate(
      {
        _id: student.address._id,
      },
      {
        street,
        city,
        province,
        postelCode,
      }
    );

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
  }
};

const detailSchedule = async (req, res) => {
  const scheduleId = req.query.scheduleId;

  const schedule = await scheduleModel.findOne({ _id: scheduleId });
  if (!schedule) return res.status(422).json({ message: "Schedule Not Found" });

  try {
    res.status(200).json({ message: "Success", schedule });
  } catch (error) {
    console.log(error);
  }
};

const deleteTeacher = async (req, res) => {
  const id = req.params.id;
  try {
    const teacher = await teacherModels.findOneAndDelete({ _id: id });
    // no data
    if (!teacher) return res.status(422).json({ message: "Id not found" });

    // success
    return res
      .status(200)
      .json({ message: "Success", result: `Id ${id} deleted` });
  } catch (error) {
    console.log(error);
  }
};

const viewClass = async (req, res) => {
  const querySort = req.query.sort;
  const cls = await classRoomModel.find();
  try {
    const sortByDate = (cls, querySort) => {
      if (querySort) {
        return cls.sort((a, b) => {
          return a.createdAt > b.createdAt ? querySort : querySort;
        });
      }

      return cls;
    };

    sortByDate(cls, querySort);

    res.status(200).json({ message: "Success", result: cls });
  } catch (error) {
    console.log(error);
  }
};

const addClass = async (req, res) => {
  const classRoom = req.body.classRoom;
  const homeRoomTeacher = req.body.homeRoomTeacher;

  // find teacher
  const teacher = await teacherModels.findOne({ fullName: homeRoomTeacher });
  if (!teacher)
    return res.status(422).json({ message: "Teacher Name not found" });

  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(404).json({ validation: errors.array() });

  // coint ++
  const count = (await classRoomModel.find().countDocuments()) + 1;

  try {
    const cls = new classRoomModel({
      codeClass: "CS0" + count,
      classRoom: classRoom.toUpperCase(),
      homeRoomTeacher: teacher.fullName,
    });

    const newClass = await cls.save();
    res.status(200).json({ message: "Success", result: newClass });
  } catch (error) {
    console.log(error);
  }
};

const deleteClass = async (req, res) => {
  const id = req.params.id;
  try {
    const classRoom = await classRoomModel.findByIdAndDelete({ _id: id });
    if (!classRoom)
      return res.status(200).json({ message: "Class room not found" });
    res.status(200).json({ message: "Success", result: `Id ${id} deleted` });
  } catch (error) {
    console.log(error);
  }
};

const editClass = async (req, res) => {
  const classId = req.query.classId;
  const homeRoomTeacher = req.body.homeRoomTeacher;
  const classRoom = req.body.classRoom;

  // not found
  const classRoomValidation = await classRoomModel.findById({ _id: classId });
  if (!classRoomValidation)
    return res.status(422).json({ message: "Id Not Found" });

  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
  try {
    const homeRoomTeachers = await classRoomModel.findByIdAndUpdate(
      { _id: classId },
      { homeRoomTeacher: homeRoomTeacher, classRoom: classRoom }
    );
    res.status(200).json({ message: "Success", result: homeRoomTeachers });
  } catch (error) {
    console.log(error);
  }
};

const detailClass = async (req, res) => {
  const classId = req.query.classId;

  const classT = await classRoomModel.findById({ _id: classId });
  // not found
  if (!classT) return res.status(422).json({ message: "Id Not found" });
  try {
    res.status(200).json({ message: "Success", result: classT });
  } catch (error) {
    console.log(error);
  }
};

const editTeacher = async (req, res) => {
  const teacherId = req.query.teacherId;
  const name = req.query.fullName;
  const fullName = req.body.fullName;
  const status = req.body.status;
  const province = req.body.province;
  const city = req.body.city;
  const street = req.body.street;
  const postelCode = req.body.postelCode;

  const teacher = await teacherModels.findOne({
    _id: teacherId,
    fullName: name,
  });

  // Not found
  if (!teacher) return res.status(422).json({ message: "Data Not Found" });
  // from validation
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });

  try {
    await teacherModels.findByIdAndUpdate(
      {
        _id: teacher._id,
      },
      { fullName, status }
    );
    await streetModel.findByIdAndUpdate(
      { _id: teacher.address._id },
      { province, city, street, postelCode }
    );
    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
  }
};

const deleteStudent = async (req, res) => {
  const id = req.params.id;
  const checkFound = await studentModel.findOne({ _id: id });
  if (!checkFound) return res.status(404).json({ message: "Not found" });

  try {
    const student = await studentModel.findByIdAndDelete({ _id: id });
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(data);
  }
};

const viewAccount = async (req, res) => {
  const sortQuery = req.query.sort;

  try {
    // find account by confirmation false
    const confrim = await authModel.find({
      accountConfirmation: false,
    });

    if (sortQuery === "Staff") {
      const staff = await staffModel.find({});
      const data = staff.filter(({ email }) => email !== null);
      return res.status(200).json({ confirmation: confrim, users: data });
    } else if (sortQuery === "Teacher") {
      const teacher = await teacherModels.find({});
      const data = teacher.filter(({ email }) => email !== null);
      return res.status(200).json({ confirmation: confrim, users: data });
    } else if (sortQuery === "Student") {
      const student = await studentModel.find({});
      const data = student.filter(({ email }) => email !== null);
      return res.status(200).json({ confirmation: confrim, users: data });
    } else {
      return res.status(404).json({ error: "Opps, Halaman tidak tersedia" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Keslahan" });
  }
};

module.exports = {
  viewAccount,
  editStudent,
  deleteStudent,
  editTeacher,
  detailClass,
  editClass,
  getAllData,
  confirmAccount,
  addSchedule,
  viewSchedule,
  editSchedule,
  deleteSchedule,
  viewTeacher,
  detailTeacher,
  viewStudent,
  detailStudent,
  addTeacher,
  addStudent,
  detailSchedule,
  deleteTeacher,
  addClass,
  deleteClass,
  viewClass,
  getStaff,
};
