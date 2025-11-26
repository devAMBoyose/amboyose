import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
} from "../controllers/items.controller.js";

const router = Router();

// CREATE item (admin, staff)
router.post("/", auth, allowRoles("admin", "staff"), createItem);

// GET all items (any logged-in user)
router.get("/", auth, getItems);

// GET single item
router.get("/:id", auth, getItemById);

// UPDATE item
router.put("/:id", auth, allowRoles("admin", "staff"), updateItem);

// DELETE item
router.delete("/:id", auth, allowRoles("admin"), deleteItem);

export default router;   // 👈 VERY IMPORTANT
