import express from "express";
import Review from "../models/Review.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route GET /api/reviews/book/:bookId
router.get("/book/:bookId", async (req, res) => {
    try {
        const reviews = await Review.find({ book: req.params.bookId })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) {
        console.error("Get reviews error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route POST /api/reviews/book/:bookId
router.post("/book/:bookId", protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.create({
            book: req.params.bookId,
            user: req.user._id,
            rating,
            comment
        });
        res.status(201).json(review);
    } catch (err) {
        console.error("Create review error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
