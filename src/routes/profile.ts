import { Router } from "express";
import { updateProfile } from "../controller/profileController.js";
import isUser from "../middleware/auth.js";
import { upload } from "../middleware/uplote.js";

const router = Router();

router.post("/profile", isUser, upload.single("image"), updateProfile);

export default router; 