import mongoose from "mongoose";

const capacitySchema = new mongoose.Schema(
  {
    capacity: {
      type: String,
      required: true,
      trim: true, // giúp loại bỏ khoảng trắng thừa
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Capacity = mongoose.model("Capacity", capacitySchema);
export default Capacity;
