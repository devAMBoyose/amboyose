// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

// load .env
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ROUTES
import authRoutes from "./routes/auth.routes.js";
import itemRoutes from "./routes/items.routes.js";
import consignmentRoutes from "./routes/consignments.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/consignments", consignmentRoutes);

// PORT
const PORT = process.env.PORT || 5000;

// START SERVER
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
});
