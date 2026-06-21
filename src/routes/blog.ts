import express from "express";
import { getOneBlog } from "../controller/blogController.js";
import isUser from "../middleware/auth.js";
const router = express.Router();

router.get("/blog/:id" , isUser, getOneBlog)

export default router;