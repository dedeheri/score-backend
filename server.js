require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();

const setDatabase = require("./src/database/database");
const routerStaff = require("./src/router/staff.router");
const routerTeacher = require("./src/router/teacher.router");
const routerStudent = require("./src/router/student.router");
const routerAuth = require("./src/router/auth/auth");

const { handleError } = require("./src/middleware/errors");

// connect to monggoDb
setDatabase();

// midleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin:
      process.env.NODE_DEV === "development"
        ? process.env.BASE_URL_DEVELOPMENT
        : process.env.BASE_URL_PRODUCTICON,
  })
);
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.send("Access Daniel");
});

// endpoint
app.use("/api", routerStaff);
app.use("/api", routerTeacher);
app.use("/api", routerStudent);
app.use("/api", routerAuth);

// app.use(notFound);
app.use(handleError);

// listen
mongoose.connection.once("open", () => {
  app.listen(process.env.PORT, () => {
    console.log("server running");
  });
});
