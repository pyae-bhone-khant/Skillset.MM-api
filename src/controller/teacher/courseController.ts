import type { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { getUserById } from "../../services/user.js";
import { checkCategoryIfNotExit,  } from "../../utils/blogs.js";
import { checkUserIfNotExit } from "../../utils/user.js";
import { getCategoryDataByName } from "../../services/blog.js";
import {v2 as cloudinary} from "cloudinary"
import { createCourseData, getCourseById, updateCourseData } from "../../services/course.js";
import { cacheQueue } from "../../jobs/queue/cacheQueue.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
});
 
interface CustomRequest extends Request {
   user ?: {id : string}
}

export const createCourse  : any[]=  [
  body("title" , "Title must be a string").isString().notEmpty().trim(),
  body("description" , "Description must be a string").isString().notEmpty().trim(),
  body("category" , "Category must be a string").isString().notEmpty().trim(),
 async (req : CustomRequest , res : Response , next : NextFunction) => {

      const error = validationResult(req).array({onlyFirstError : true});
         if (error.length > 0) {
           return next(new Error(error[0]?.msg || "Invalid ID"));
         }
          
        const userId =  req.user?.id ; 
        const user  = await getUserById(userId!); 
        await checkUserIfNotExit(user);
        
           const {title , description , category} = req.body;
           const newImg  = req.file ;   

           if(!newImg){
            return next(new Error("Image is required"));
           } 

           const uploadResult = await cloudinary.uploader.upload(newImg.path, {
             folder: "courses",
           });
           const imageUrl = uploadResult.secure_url;
           const publicId = uploadResult.public_id; 

           if (!imageUrl || !publicId) {
             return next(new Error("Image upload failed"));
           }

           const checkCategory = await getCategoryDataByName(category);
           if (!checkCategory) {
            return next(new Error("Category is not found"));
           }
           
           const courseData = {
             title,
             description ,
             categoryId : checkCategory.id ,
             teacherId : userId ,
             imageUrl,
             publicId
           }

           const course = await createCourseData(courseData); 
           await cacheQueue.add("delete-cache-courses" , {
                      pattern: `courses:*`} ,
                      {
                          jobId : `invalidate ${Date.now()}` ,
                          priority : 1 
                      }
                  );
    
    res.status(200).json({ success : true ,  message : " create  Course  successfully" , course : course })
}] 

export const updateCourse : any =  [
  param("id" , "Course ID must be number").notEmpty().isInt({gt : 0}).withMessage("Course ID must be greater than 0").toInt(), 
  body("title" , "Title must be a string").isString().notEmpty().trim(),
  body("description" , "Description must be a string").isString().notEmpty().trim(),
  body("category" , "Category must be a string").isString().notEmpty().trim()
 ,async (req : CustomRequest , res : Response , next : NextFunction) => {
   
      const error = validationResult(req).array({onlyFirstError : true});
         if (error.length > 0) {
           return next(new Error(error[0]?.msg || "Invalid ID"));
         }
          
        const userId =  req.user?.id ; 
        const user  = await getUserById(userId!); 
        await checkUserIfNotExit(user);
        
           const {title , description , category} = req.body;
           const courseId  = parseInt(req.params.id as string , 10);
           const newImg  = req.file ;   

           if(!newImg){
            return next(new Error("Image is required"));
           }   
        
           const getCourse = await getCourseById(+courseId);
           
           if(!getCourse){
            return next(new Error("Course not found"));
           }

           let imageUrl  =  getCourse.imageUrl ;
           let publicId = getCourse.publicId ; 
            if(imageUrl){
              await cloudinary.uploader.destroy(publicId)
            } 
            
           const uploadResult = await cloudinary.uploader.upload(newImg.path, {
             folder: "courses",
           });
           imageUrl = uploadResult.secure_url;
           publicId = uploadResult.public_id; 

           if (!imageUrl || !publicId) {
             return next(new Error("Image upload failed"));
           }

           const checkCategory = await getCategoryDataByName(category);
           if (!checkCategory) {
            return next(new Error("Category is not found"));
           }
           
           const courseData = {
             title,
             description , 
             categoryId : checkCategory.id ,
             teacherId : userId ,
             imageUrl,
             publicId
           }

           const course = await updateCourseData(courseId , courseData); 
             await cacheQueue.add("delete-cache-courses" , {
                      pattern: `courses:*`} ,
                      {
                          jobId : `invalidate ${Date.now()}` ,
                          priority : 1 
                      }
           
                  );    
    
    res.status(200).json({ success : true ,  message : " update  Course  successfully" , course : course })
}]