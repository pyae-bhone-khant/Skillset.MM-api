import type { NextFunction, Request, Response } from "express";
import { body, param , validationResult } from "express-validator";
import { getUserById } from "../../services/user.js";
import { checkUserIfNotExit } from "../../utils/user.js";
import { createChapterData, deleteChapterData, fineCapcter, updateChapterData } from "../../services/chapter.js";
import { cacheQueue } from "../../jobs/queue/cacheQueue.js";

interface CustomRequest extends Request {
    user : {
        id : string;
    } 
}

export const createChapter : any[] = [
    param("id")
    .isInt({ gt: 0 })
    .withMessage("Invalid ID")
    .toInt(), 
    body("title").notEmpty().withMessage("Title is required").isString().trim(),
    body("videoUrl").notEmpty().withMessage("Video URL is required").isString().trim(),    
    body("sortingNo").notEmpty().withMessage("Sorting No is required").isInt({ gt: 0 }).withMessage("Invalid Sorting No").toInt(), 
    async (req:CustomRequest,res:Response,next:NextFunction) =>{
          const error = validationResult(req).array({onlyFirstError : true});
                 if (error.length > 0) {
                   return next(new Error(error[0]?.msg || "Invalid ID"));
                 }
                  
                const userId =  req.user?.id  ; 
                const user  = await getUserById(userId!); 
                await checkUserIfNotExit(user);

                const courseId = parseInt(req.params.id as string , 10);
                const {title,videoUrl,sortingNo} = req.body;
                

                const capterData  = {
                    title,
                    videoUrl,
                    sortingNo,
                }

                const capterCreate = await createChapterData( courseId, capterData);
                 await cacheQueue.add("delete-cache-courses" , {
                                 pattern: `chapters:*`} ,
                              {
                                  jobId : `invalidate ${Date.now()}` ,
                                  priority : 1 
                              }
                          );
                res.status(200).json({
                    success : true,
                    message : "Chapter created successfully",
                    data : capterCreate
                });
    
}]

export const updateChapterByCourseId : any[] = [
    param("courseId")
    .isInt({ gt: 0 })
    .withMessage("Invalid Course ID")
    .toInt(),
    param("capterId")
    .isInt({ gt: 0 })
    .withMessage("Invalid Chapter ID")
    .toInt(),
    body("title").notEmpty().withMessage("Title is required").isString().trim(),
    body("videoUrl").notEmpty().withMessage("Video URL is required").isString().trim(),    
    body("sortingNo").notEmpty().withMessage("Sorting No is required").isInt({ gt: 0 }).withMessage("Invalid Sorting No").toInt(), 
    async (req : CustomRequest , res : Response , next : NextFunction) => {

        const error = validationResult(req).array({onlyFirstError : true});
        if(error.length > 0){
            return next(new Error(error[0]?.msg || "Invalid ID"));
        }

        const userId = req.user?.id;
        const user = await getUserById(userId!);
        await checkUserIfNotExit(user);

        const courseId = parseInt(req.params.courseId  as string, 10);
        const capterId = parseInt(req.params.capterId  as string, 10);
        const {title , videoUrl , sortingNo} = req.body;  

        const chapterData = {
            title,
            videoUrl,
            sortingNo,
        }

        const updateChapter = await updateChapterData(courseId , capterId , chapterData);
         await cacheQueue.add("delete-cache-courses" , {
                                 pattern: `chapters:*`} ,
                              {
                                  jobId : `invalidate ${Date.now()}` ,
                                  priority : 1 
                              }
                          );
        res.status(200).json({
            success : true,
            message : "Chapter updated successfully",
            data : updateChapter
        });
    }

] 

export const deleteChapter : any[] = [
    param("courseId")
    .isInt({ gt: 0 })
    .withMessage("Invalid Course ID")
    .toInt(),
    param("capterId")
    .isInt({ gt: 0 })
    .withMessage("Invalid Chapter ID")
    .toInt(), 
    async (req:CustomRequest,res:Response,next:NextFunction) => {
        const error = validationResult(req).array({onlyFirstError : true});
        if(error.length > 0){
            return next(new Error(error[0]?.msg || "Invalid ID"));
        }

        const userId = req.user?.id;
        const user = await getUserById(userId!);
        await checkUserIfNotExit(user);

        const courseId = parseInt(req.params.courseId  as string, 10);
        const capterId = parseInt(req.params.capterId  as string, 10);
        if (!courseId || !capterId) {
          return next(new Error("Invalid ID"));
        }  
        const option = {
             where: {
                id: capterId,
                courseId: courseId,
            }, 
        } 

        const chapter = await fineCapcter(option) 
         if(!chapter) {
          return next(new Error("Chapter not found"));
         }
        
        const deleteChapter = await deleteChapterData(courseId , capterId);
        if (!deleteChapter) {
          return res.status(404).json({ success: false, message: "Chapter မရှိပါ" });
        }
        await cacheQueue.add("delete-cache-courses" , {
                                 pattern: `chapters:*`} ,
                              {
                                  jobId : `invalidate ${Date.now()}` ,
                                  priority : 1 
                              }
                          );
        res.status(200).json({
            success : true,
            message : "Chapter deleted successfully",
            data : deleteChapter
        });
    }
]
    




