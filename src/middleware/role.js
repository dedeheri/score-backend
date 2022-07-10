const auth = require("../model/auth/auth");

const authority = (role) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const data = await auth.findById(userId);
    if (!data) return res.status(404).json({ message: "access Daniel" });
    data.role !== role
      ? res.status(401).json({ message: `You don't have permission` })
      : next();
  };
};
module.exports = {
  authority,
};
