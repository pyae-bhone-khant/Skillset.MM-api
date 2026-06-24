import express from "express"; 
import { createChapter, deleteChapter,  updateChapterByCourseId, } from "../../controller/teacher/capterController.js";
import isTeacher from "../../middleware/auth.js";
import isUser from "../../middleware/auth.js";
const router = express.Router(); 


router.post("/chapter/create/:id" ,  isUser ,  isTeacher, createChapter)
router.post("/chapter/update/courseId/:courseId/capterId/:capterId" ,  isUser , isTeacher, updateChapterByCourseId)
router.delete("/chapter/update/courseId/:courseId/capterId/:capterId" , isUser , isTeacher, deleteChapter)


export default router;
