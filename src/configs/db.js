import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbUrl = process.env.MONGO_URI;
    if (!dbUrl) {
      throw new Error("Missing MONGO_URI in environment variables");
    }
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ Failed to connect MongoDB:", error.message);
    process.exit(1); // Dừng server nếu kết nối thất bại
  }
};

export default connectDB;
