const { check } = require("express-validator");

const validate = (props) => {
  switch (props) {
    case "ADD_SCHEDULE": {
      return [
        check("course", "Pelajaran tidak boleh kosong").notEmpty(),
        check("classRoom", "Kelas room tidak boleh kosong").notEmpty(),
        check("day", "Hari tidak boleh kosong").notEmpty(),
        check("time", "Waktu tidak boleh kosong").notEmpty(),
      ];
    }
    case "SIGNUP_STAFF": {
      return [
        check("fullName", "Nama Lengkap tidak boleh kosong").notEmpty(),
        check(
          "identityNumber",
          "Nomber Identitas tidak boleh kosong"
        ).notEmpty(),
        check("province", "Provinsi tidak boleh kosong").notEmpty(),
        check("city", "Kota tidak boleh kosong").notEmpty(),
        check("street", "Jalan tidak boleh kosong").notEmpty(),
        check("postelCode", "Kode pos tidak boleh kosong").notEmpty(),
        check("email", "Email tidak boleh kosong").notEmpty(),
        check(
          "password",
          "Kata sandi harus memiliki minimal 6 karakter "
        ).isLength({
          min: 6,
        }),
      ];
    }
    case "SIGNIN": {
      return [
        check("identityNumber", "Invalid Identity Number")
          .notEmpty()
          .isNumeric()
          .withMessage("Must be number"),
        check("password", "Password must be then 6 character ").isLength({
          min: 6,
        }),
      ];
    }

    case "FORGET": {
      return [check("email", "Email tidak boleh kosong").notEmpty()];
    }

    case "UPDATE_TEACHER": {
      return [
        check("fullName", "Invalid Name").notEmpty(),
        check("status", "Status can not be empty").notEmpty(),
        check("province", "Province can not be empty").notEmpty(),
        check("city", "City can not be empty").notEmpty(),
        check("street", "Street can not be empty").notEmpty(),
        check("postelCode", "Postel Code can not be empty")
          .notEmpty()
          .isNumeric()
          .withMessage("Must be number"),
      ];
    }
    case "ADD_TEACHER": {
      return [
        check("fullName", "Nama tidak boleh kosong").notEmpty(),
        check(
          "identityNumber",
          "Nomber Indentitas tidak boleh kosong"
        ).notEmpty(),
        check("status", "Status tidak boleh kosong").notEmpty(),
        check("province", "Provinsi tidak boleh kosong").notEmpty(),
        check("city", "Kota tidak boleh kosong").notEmpty(),
        check("street", "Jalan tidak boleh kosong").notEmpty(),
        check("postelCode", "Kode Pos tidak boleh kosong").notEmpty(),
      ];
    }
    case "ADD_STUDENT": {
      return [
        check("fullName", "Nama Lengkap tidak boleh kosong").notEmpty(),
        check(
          "identityNumber",
          "Nomer Indentitas tidak boleh kosong"
        ).notEmpty(),
        check("classRoom", "Kelas tidak boleh kosong").notEmpty(),
        check("province", "Provinsi tidak boleh kosong").notEmpty(),
        check("city", "Kota tidak boleh kosong").notEmpty(),
        check("street", "Jalan tidak boleh kosong").notEmpty(),
        check("postelCode", "Kode pos tidak boleh kosong").notEmpty(),
      ];
    }
    case "PASSWORD": {
      return [
        check("password", "Kata sandi Harus memiliki 6 karakter atau lebih")
          .isString()
          .isLength({
            min: 6,
          }),
        check(
          "repeatPassword",
          "Ulangi Kata sandi Harus memiliki 6 karakter atau lebih"
        )
          .notEmpty()
          .custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error("Password not match");
            }
            return true;
          }),
      ];
    }
    case "UPDATE_SCHEDULE": {
      return [
        check("course", "Pelajaran tidak boleh kosong").notEmpty(),
        check("classRoom", "Kelas room tidak boleh kosong").notEmpty(),
        check("day", "Hari tidak boleh kosong").notEmpty(),
        check("time", "Waktu tidak boleh kosong").notEmpty(),
      ];
    }
    case "ADD_CLASS": {
      return [
        check("homeRoomTeacher", "Guru tidak boleh kosong").notEmpty(),
        check("classRoom", "Kelas tidak boleh kosong").notEmpty(),
      ];
    }
    case "ADD_TASK": {
      return [
        check("course", "Mata pelajaran tidak boleh kosong").notEmpty(),
        check("attendance")
          .notEmpty()
          .withMessage("Kehadiran tidak boleh kosong"),
        check("bcOne")
          .notEmpty()
          .withMessage("Kompetensi dasar satu tidak boleh kosong"),
        check("bcTwo")
          .notEmpty()
          .withMessage("Kompetensi dasar dua tidak boleh kosong"),
        check("bcThree")
          .notEmpty()
          .withMessage("Kompetensi dasar tiga tidak boleh kosong"),
        check("bcFour")
          .notEmpty()
          .withMessage("Kompetensi dasar empat tidak boleh kosong"),
        check("midtermExam").notEmpty().withMessage("UTS tidak boleh kosong"),
        check("finalExams").notEmpty().withMessage("UAS tidak boleh kosong"),
      ];
    }
  }
};

module.exports = validate;
