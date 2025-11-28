import express from "express";
import Book from "../models/Book.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route GET /api/books?page=&limit=
router.get("/", async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [books, total] = await Promise.all([
            Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Book.countDocuments()
        ]);

        res.json({
            data: books,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        console.error("Get books error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route GET /api/books/:id
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.json(book);
    } catch {
        res.status(400).json({ message: "Invalid ID" });
    }
});

// @route POST /api/books
router.post("/", protect, async (req, res) => {
    try {
        const { title, author, description, publishedYear, genre } = req.body;
        const book = await Book.create({
            title,
            author,
            description,
            publishedYear,
            genre,
            createdBy: req.user._id
        });
        res.status(201).json(book);
    } catch (err) {
        console.error("Create book error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route PUT /api/books/:id
router.put("/:id", protect, async (req, res) => {
    try {
        const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (!updated) return res.status(404).json({ message: "Book not found" });
        res.json(updated);
    } catch {
        res.status(400).json({ message: "Invalid ID" });
    }
});

// @route DELETE /api/books/:id
router.delete("/:id", protect, async (req, res) => {
    try {
        const deleted = await Book.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Book not found" });
        res.json({ message: "Book deleted" });
    } catch {
        res.status(400).json({ message: "Invalid ID" });
    }
});

export default router;
