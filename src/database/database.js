const mongoose = require("mongoose");

async function setDatabaseConfig() {
  try {
    await mongoose.connect(
      process.env.NODE_DEV === "development"
        ? process.env.DATABASE_LOCAL
        : process.env.DATABASE_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  } catch (error) {
    console.log(error);
  }
}

module.exports = setDatabaseConfig;
