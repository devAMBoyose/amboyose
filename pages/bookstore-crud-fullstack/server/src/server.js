import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/books.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";

dotenv.config();
const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true
    })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({ message: "Bookstore CRUD API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () =>
        console.log(`🚀 API running on port ${PORT}`)
    );
});
