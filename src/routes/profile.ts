import { Router } from "express";
import { updateProfile , getUserData } from "../controller/profileController.js";
import isUser from "../middleware/auth.js";
import { upload   } from "../middleware/uplote.js";

const router = Router();

router.post("/profile", isUser, upload.single("image"), updateProfile);
router.get("/user" , isUser , getUserData )

export default router;  
