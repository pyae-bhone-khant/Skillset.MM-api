import express from "express" ; 
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../../../controller/admin/category/categoryController.js";
import isUser, { isAdmin, isTeacher } from "../../../middleware/auth.js";
const router = express.Router();

router.post("/admin/create-category", isUser , isAdmin , createCategory) ; 
router.get("/admin/categories", isUser , isTeacher ,  getAllCategories);
router.delete("/admin/delete-category/:id", isUser , isAdmin , deleteCategory);
router.post("/admin/update-category/:id", isUser , isAdmin , updateCategory);
export default router ;