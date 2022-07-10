const jwt = require("jsonwebtoken");

const authorization = (req, res, next) => {
  const token = req.cookies.token;
  // no token
  if (!token) {
    return res.status(401).json({
      massage: "Access Denied",
    });
  }

  try {
    const verifyToken = jwt.verify(token, process.env.TOKENSECRET);
    req.user = verifyToken;

    next();
  } catch (error) {
    res.status(400).json({
      massage: "Wrong Token",
    });
    console.log(error);
  }
};

module.exports = authorization;
