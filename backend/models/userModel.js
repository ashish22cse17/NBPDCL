const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["accepted", "held", "blocked"],
    default: "accepted",
  },
   centerId: {
    type: String,
    required: false, 
  },
  location:{
    type:String,
    require:false,
  },
  designation: {
    type: String,
    required: false, 
  },
});

module.exports = mongoose.model("User", userSchema);
