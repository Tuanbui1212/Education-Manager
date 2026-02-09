import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // Lấy chuỗi kết nối từ file .env
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${(error as Error).message}`);
    // Nếu lỗi thì dừng server luôn để tránh chạy sai
    process.exit(1);
  }
};

export default connectDB;
