import express from "express";
import { getCourseByPagination  , getCourseByCoursePagination, getCourseByOwner} from "../controller/courseController.js";
import isUser from "../middleware/auth.js";

const router = express.Router() 

router.get("/course",  isUser , getCourseByPagination )
router.get("/course/course",  isUser , getCourseByCoursePagination )
router.get("/course/owner",  isUser , getCourseByOwner)


export default router;  