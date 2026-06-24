import express from "express" ; 
import { getChapterAll , getChapterByCusurPagelitaion } from "../controller/chapterController.js";
import isUser from "../middleware/auth.js";
const router = express.Router();

router.get("/chapter/:id" ,  isUser ,  getChapterAll )
router.get("/chapter/cusur/:id" ,  isUser ,  getChapterByCusurPagelitaion )



export default router ; 
