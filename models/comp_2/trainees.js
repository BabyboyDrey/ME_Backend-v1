const mongoose = require("mongoose");

const traineesSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  gender: String,
  age: Number,
  address: String,
  phone_number: Number,
  email: String,
  skill: String,
  state_of_origin: String,
  business_name: String,
});

traineesSchema.index({ phone_number: 1 });

module.exports = Trainees = mongoose.model("Trainees", traineesSchema);
