
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    address: { type: String, default: "" },
    role: {
        type: String,
        enum: ["admin", "user", "staff"], // Thêm quyền mới vào đây
        default: "user"
    },

    isActive: { type: Boolean, default: true },
})
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});
const UserModel = mongoose.model("UserModel", userSchema);
export default UserModel;



