const mongoose = require("mongoose");
const { PASS_LENGTH, HTTP_CODES } = require("../../config/Enum");
const is = require("is_js");
const CustomError = require("../../lib/Error");
const bcrypt = require("bcryptjs");

const schema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  is_active: { type: Boolean, default: true },
  first_name: String,
  last_name: String,
  phone_number: String,
},{
  versionKey: false,
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  } 
});

class Users extends mongoose.Model {

    // Giriş yaparken şifreyi kontrol eden metot
    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }

    // Giriş denemesinde gelen verileri ön validasyondan geçiren metot
    static validateFieldsBeforeAuth(email, password) {
      if (typeof password !== "string" || password.length < PASS_LENGTH) {
        throw new CustomError(HTTP_CODES.UNAUTHORIZED, "Validation Error", "Password must be at least " + PASS_LENGTH + " characters.");
      }
      return null;
    } 
} 

schema.loadClass(Users);
module.exports = mongoose.model("users", schema);