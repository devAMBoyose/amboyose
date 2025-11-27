// src/controllers/items.controller.js
import Item from "../models/Item.js";

/**
 * Helper: normalize request body so we always use `quantityOnHand`
 * in the database, but allow the client to send either `onHand`
 * or `quantityOnHand`.
 */
function normalizeItemBody(body = {}) {
    const {
        sku,
        name,
        category,
        location,
        expiryDate,
        minStock,
        quantityOnHand,
        onHand,
        ...rest
    } = body;

    // Prefer explicit quantityOnHand, else fall back to onHand, else 0
    const qty =
        quantityOnHand !== undefined
            ? quantityOnHand
            : onHand !== undefined
                ? onHand
                : 0;

    return {
        sku,
        name,
        category,
        location,
        expiryDate,
        minStock: minStock !== undefined ? Number(minStock) : undefined,
        quantityOnHand: Number(qty) || 0,
        // keep any extra fields you might add later (e.g. notes)
        ...rest,
    };
}

/**
 * POST /api/items
 * Create new inventory item
 */
export const createItem = async (req, res) => {
    try {
        const payload = normalizeItemBody(req.body);
        const item = await Item.create(payload);
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
        // Normalize body so `onHand` updates still go into quantityOnHand
        const payload = normalizeItemBody(req.body);

        const item = await Item.findByIdAndUpdate(req.params.id, payload, {
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
