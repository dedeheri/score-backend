const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const authModel = require("../../model/auth/auth");
const streetModel = require("../../model/street");
const teacherModel = require("../../model/Teacher");
const staffModel = require("../../model/staff");
const jwt = require("jsonwebtoken");
const studentModel = require("../../model/student");
const nodemailer = require("nodemailer");

function genereteRefreshToken(email) {
  return jwt.sign({ email: email }, process.env.REFRESHTOKEN);
}

function genereteAccessToken(props, exp) {
  return jwt.sign({ id: props._id }, process.env.REFRESHTOKEN, {
    expiresIn: exp,
  });
}

const signUpStaff = async (req, res) => {
  const fullName = req.body.fullName;
  const identityNumber = req.body.identityNumber;
  const password = req.body.password;
  const province = req.body.province;
  const city = req.body.city;
  const street = req.body.street;
  const postelCode = req.body.postelCode;
  const email = req.body.email;
  const role = "Staff";

  const auth = await authModel.findOne({ identityNumber });

  // Identity Number
  if (auth) {
    return res.status(422).json({ message: "Identity Number Already Exist" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ validation: errors.array() });

  // password hash
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const data = new authModel({
      identityNumber,
      password: passwordHash,
      email,
      role,
    });
    const streetData = new streetModel({
      province,
      city,
      street,
      postelCode,
    });
    const profile = new staffModel({
      fullName,
      authId: data._id,
      identityNumber: data.identityNumber,
      address: streetData._id,
      email,
    });
    const auths = await data.save();
    const profiles = await profile.save();
    await streetData.save();

    return res.status(200).json({
      message: "Success",
      users: {
        _id: profiles._id,
        identityNumber: auths.identityNumber,
        fullName: profiles.fullName,
        email: profiles.email,
        role: auths.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

const verifyStudent = async (req, res) => {
  const identityNumber = req.body.identityNumber;
  const student = await studentModel.findOne({ identityNumber });
  if (!student)
    return res.status(422).json({ message: "Identity number not found" });

  if (student.authId !== null) {
    const auth = await authModel.findById({ _id: student.authId });
    if (auth) return res.status(422).json({ message: "Akun Sudah Terdaftar" });
  }

  try {
    res.status(200).json({ message: "Success", result: student });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};

const signUpStudent = async (req, res) => {
  const identityNumber = req.query.identityNumber;
  const password = req.body.password;
  const email = req.body.email;
  const role = "Student";

  // email exist
  const student = await studentModel.findOne({
    identityNumber: identityNumber,
  });

  if (!student)
    return res
      .status(422)
      .json({ message: "No indentitas tidak dapat ditemukan" });

  // validation body
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ validation: errors.array() });

  // password hash
  const passwordHash = await bcrypt.hash(password, 10);

  // callback
  try {
    const data = new authModel({
      identityNumber: student.identityNumber,
      password: passwordHash,
      email,
      role,
      token: genereteRefreshToken(email),
    });

    const saveData = await data.save();
    await studentModel.updateOne(
      { _id: student._id },
      { authId: data._id, email: email }
    );
    res.status(200).json({ message: "Success", result: saveData });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};

const verifyTeacher = async (req, res) => {
  const identityNumber = req.body.identityNumber;
  const teacher = await teacherModel.findOne({ identityNumber });
  const auth = await authModel.findOne({ identityNumber });
  if (!teacher) {
    return res.status(404).json({ message: "No identitasi tidak ditemukan" });
  }
  if (auth) {
    return res.status(422).json({ message: "Akun sudah terdaftar" });
  }

  try {
    res.status(200).json({ message: "Success", result: teacher });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};

const signUpTeacher = async (req, res) => {
  const identityNumber = req.query.identityNumber;
  const password = req.body.password;
  const email = req.body.email;
  const role = "Teacher";

  const teacher = await teacherModel.findOne({ identityNumber });
  const auth = await authModel.findOne({ identityNumber });

  if (!teacher) {
    return res.status(422).json({ message: "Identity number Not found" });
  }

  if (auth) {
    return res
      .status(422)
      .json({ message: "Account has already registration" });
  }

  // validation form
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // password hash
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const data = new authModel({
      identityNumber: teacher.identityNumber,
      password: passwordHash,

      role,
    });

    const saveData = await data.save();
    await teacherModel.updateOne(
      { _id: teacher._id },
      { authId: data._id, email: email }
    );
    res.status(200).json({ message: "Success", result: saveData });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};

const signIn = async (req, res) => {
  const identityNumber = req.body.identityNumber;
  const password = req.body.password;

  const auth = await authModel.findOne({ identityNumber });

  // e-mail not registered
  if (!auth) {
    return res.status(404).json({ message: "No identitas belum terdaftar" });
  }

  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array() });
  }

  try {
    // password compare
    const passwordCompare = await bcrypt.compare(password, auth.password);
    // wrong password
    if (!passwordCompare)
      return res.status(422).json({ message: "Kata sandi salah" });

    const arr = [];
    switch (auth.role) {
      case "Staff": {
        const staff = await staffModel.findOne({ authId: auth._id });
        arr.push({
          fullName: staff.fullName,
        });
        break;
      }
      case "Teacher": {
        const teacher = await teacherModel.findOne({ authId: auth._id });
        arr.push({
          fullName: teacher.fullName,
        });
        break;
      }
      case "Student":
        {
          const student = await studentModel.findOne({ authId: auth._id });
          arr.push({
            fullName: student.fullName,
          });
        }
        break;
    }

    // refresh token
    await authModel.findByIdAndUpdate(
      { _id: auth._id },
      {
        token: genereteRefreshToken(auth.email),
      },
      { new: true }
    );

    // jwt sign
    const token = jwt.sign({ id: auth._id }, process.env.TOKENSECRET);
    // send cookie to browser
    res.cookie("token", token);

    res.status(200).json({
      message: "Success",
      users: {
        fullName: arr[0].fullName,
        _id: auth._id,
        identityNumber: auth.identityNumber,
        role: auth.role,
      },
      accessToken: token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
};

async function forget(req, res) {
  const email = req.body.email;

  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.mapped() });
  }

  const authorization = await authModel.findOne({ email });
  if (!authorization) {
    return res.status(404).json({ message: "Email belum terdaftar" });
  }

  try {
    const transport = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      host: process.env.NODEMAILER_HOST,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const token = genereteAccessToken(authorization.email, "1d");
    const link = `${process.env.BASE_URL}/reset?token=${token}&id=${authorization._id}`;

    await transport.sendMail(
      {
        from: process.env.NODEMAILER_USER,
        to: authorization.email,
        subjet: "Reset Password",
        text: link,
      },
      function (err) {
        if (err) {
          console.log(err);
          return res
            .status(200)
            .json({ message: `Gagal kirim email ke ${email}` });
        }

        return res
          .status(200)
          .json({ message: `Email berhasil dikirim ke ${email}` });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Terjadi Kesalahan" });
  }
}

module.exports = {
  signUpStaff,
  signUpTeacher,
  verifyStudent,
  signUpStudent,
  signIn,
  verifyTeacher,
  forget,
};
