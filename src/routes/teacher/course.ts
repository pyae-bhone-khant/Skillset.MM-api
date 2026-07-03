import express from "express" ; 
import { createCourse , updateCourse ,   } from "../../controller/teacher/courseController.js";
import isUser, { isTeacher } from "../../middleware/auth.js";
import { upload } from "../../middleware/uplote.js";

const router = express.Router();  

router.post("/createCourse" , isUser , isTeacher , upload.single("image") , createCourse);
router.post("/update/course/:id" , isUser , isTeacher , upload.single("image") , updateCourse);
// router.delete("/deleteCourse/:id" , isUser , isTeacher , deleteCourse);

export default router ; 