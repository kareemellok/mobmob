import express from "express";
import { createBook, getBooks, deleteBook, userBooks } from "../controllers/bookController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protectRoute, createBook);
router.get("/get", protectRoute, getBooks);
router.post("/delete/:id", protectRoute, deleteBook);
router.post("/user", protectRoute, userBooks);

export default router;