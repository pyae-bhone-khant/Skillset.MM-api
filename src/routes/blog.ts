import express from "express";
import { getBlogByPagination, getOneBlog, deleteBlog, getBlogByOwner, updateBlogByOwner, createBlog } from "../controller/blogController.js";
import isUser, { isTeacher } from "../middleware/auth.js";
import { getBlogByCursurPagination } from "../controller/blogController.js";
const router = express.Router();

router.get("/blog/:id" , isUser, getOneBlog)
router.get("/blogs" , isUser, getBlogByPagination)
router.get("/blogs/cursor" , isUser, getBlogByCursurPagination)
router.delete("/blog/:id" , isUser, isTeacher , deleteBlog)
router.get("/blogs/owner" , isUser, isTeacher, getBlogByOwner) 

router.post("/blogs/owner/:id" , isUser, isTeacher , updateBlogByOwner) 
router.post("/blogs/create" , isUser, isTeacher, createBlog)

export default router;