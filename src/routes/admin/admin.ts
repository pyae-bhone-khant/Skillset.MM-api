import express from "express";
import { changeRole, deleteUser, getAllUser } from "../../controller/admin/adminController.js";
import isUser, { isAdmin } from "../../middleware/auth.js";
const router = express.Router();

router.get("/admin/getAlluser", isUser , isAdmin , getAllUser);
router.post("/change-Role/:id", isUser , isAdmin , changeRole);
router.delete("/delete-user/:id", isUser , isAdmin , deleteUser);


export default router;