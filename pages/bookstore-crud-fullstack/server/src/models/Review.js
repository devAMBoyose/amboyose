import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: String
    },
    { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
