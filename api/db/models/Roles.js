const mongoose = require("mongoose");
const RolePrivileges = require("./RolePrivileges");

const schema = mongoose.Schema({
  role_name: {type: String, required: true, unique: true},
  is_active: {type: Boolean, default: true},
  created_by: {
    type: mongoose.SchemaTypes.ObjectId,
  }
},{
   versionKey: false,
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  } 
});

class Roles extends mongoose.Model {

    static async deleteWithPrivileges(id) {
        await RolePrivileges.deleteMany({ role_id: id });
        await this.deleteOne({ _id: id });
    }

}

schema.loadClass(Roles);
module.exports = mongoose.model("roles",schema);
