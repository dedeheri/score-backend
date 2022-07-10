const auth = require("../model/auth/auth");

const confirmAccount = async (req, res, next) => {
  const id = req.user.id;
  const confirm = await auth.findOne({ _id: id });
  if (confirm == null || confirm.accountConfirmation == false) {
    return res.status(401).json({ massage: "Akun anda belum di konfirmasi" });
  }

  next();
};

module.exports = confirmAccount;
