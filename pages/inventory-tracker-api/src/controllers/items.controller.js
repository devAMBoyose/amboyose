// src/controllers/items.controller.js
import Item from "../models/Item.js";

/**
 * POST /api/items
 * Create new inventory item
 */
export const createItem = async (req, res) => {
    try {
        const item = await Item.create(req.body);
        return res.status(201).json(item);
    } catch (err) {
        console.error("createItem error:", err);
        return res.status(400).json({ message: err.message });
    }
};

/**
 * GET /api/items
 * List all items
 */
export const getItems = async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        return res.json(items);
    } catch (err) {
        console.error("getItems error:", err);
        return res.status(500).json({ message: "Failed to load items" });
    }
};

/**
 * GET /api/items/:id
 * Get one item by ID
 */
export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        return res.json(item);
    } catch (err) {
        console.error("getItemById error:", err);
        return res.status(400).json({ message: "Invalid ID" });
    }
};

/**
 * PUT /api/items/:id
 * Update item
 */
export const updateItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!item) return res.status(404).json({ message: "Item not found" });
        return res.json(item);
    } catch (err) {
        console.error("updateItem error:", err);
        return res.status(400).json({ message: err.message });
    }
};

/**
 * DELETE /api/items/:id
 * Delete item
 */
export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        return res.json({ message: "Item deleted" });
    } catch (err) {
        console.error("deleteItem error:", err);
        return res.status(400).json({ message: "Invalid ID" });
    }
};
