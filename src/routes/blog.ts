import express from "express";
import { getBlogByPagination, getOneBlog } from "../controller/blogController.js";
import isUser from "../middleware/auth.js";
import { getBlogByCursurPagination } from "../controller/blogController.js";
const router = express.Router();

router.get("/blog/:id" , isUser, getOneBlog)
router.get("/blogs" , isUser, getBlogByPagination)
router.get("/blogs/cursor" , isUser, getBlogByCursurPagination)

export default router;