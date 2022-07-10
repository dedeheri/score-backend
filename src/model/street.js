const mongoose = require("mongoose");

const validation = {
  required: true,
  type: String,
};
const streetSchema = new mongoose.Schema({
  province: validation,
  city: validation,
  street: validation,
  postelCode: validation,
});

const street = mongoose.model("address", streetSchema);
module.exports = street;
