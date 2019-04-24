const mongoose = require('mongoose');
const SCHEMA = mongoose.Schema;

let UserSchema = new SCHEMA({
  name: {type: String, required: true},
  surname: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  mssg_box: {type: Array, required: true}
});

let DataBaseSchema = new SCHEMA({
  PERIOD: { type: String, required: true },
  MSSGBOX: { type: Array, required: true }
})

module.exports.User = mongoose.model('Users', UserSchema);
module.exports.userDataBase = mongoose.model('userDataBase', DataBaseSchema);