const mongoose = require("mongoose");

const user = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {collection: 'users'});


module.exports = mongoose.model('User', user)