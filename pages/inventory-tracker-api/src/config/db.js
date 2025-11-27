import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing in environment variables");

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(uri, {
            // these are optional on Mongoose 8, but safe:
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB error:", err.message);
        process.exit(1);
    }
};
