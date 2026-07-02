import type { Request, Response, NextFunction } from "express";
import { checkUserIfNotExit } from "../utils/user.js";
import { getUserById } from "../services/user.js";
import { query, validationResult } from "express-validator";
import { getOrCache } from "../lib/cache.js";
import {getCourseByCoursePaginationData , getOwnCourseDataByTeacherId} from "../services/course.js"
import { profile } from "node:console";
export const getCourseByPagination = [
  query("page")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ gt: 4 })
    .withMessage("Limit must be greater than 4"),
  async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req).array({ onlyFirstError: true });
    if (error.length > 0) {
      return next(new Error(error[0]?.msg || "Invalid ID"));
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 5;

    const userId = (req as any).user?.id;
    const user = await getUserById(userId);
    await checkUserIfNotExit(user);

     const skip = (+page -1 )* +limit; 
     
     const option = {
      skip,
      take: +limit + 1 ,
      select : {
        id : true , 
        title : true ,
        description : true ,
        imageUrl : true,
        category :  {
            select : {
                name : true
            }
        } ,
       teacher: {
      select: { // <--- ဒီ select ကို မဖြစ်မနေ ထည့်ပေးရပါမယ်
        profile: {
          select: { // <--- profile အတွက်လည်း select ထပ်ထည့်ပေးရပါမယ်
            fullName: true,
            avatarUrl: true
          }
        }
      }
    },
        chapters : true ,
        updatedAt : true ,
      } ,
       orderBy : {
        updatedAt : "desc"
       }
     } 
     
      const cacheKey = `courses:${JSON.stringify(req.query)}` ;
          const courses = await getOrCache(cacheKey, async() => await getCourseByCoursePaginationData(option) );
         const hasNextPage = courses.length > +limit; 
         let nextPage = null;
         let previousPage = +page !== 1 ? +page - 1 : null;
         if (hasNextPage) {
             courses.pop();
             nextPage = +page + 1;
         } 

         const courseData = courses.map((c : any) => {
            return {
                id: c.id,
                title: c.title,
                description: c.description,
                category: c.category.name,
                imageUrl: c.imageUrl,
                fullName: c.teacher.profile.fullName,
                avatarUrl: c.teacher.profile.avatarUrl,
                chapters: c.chapters,
                updatedAt: new Date(c.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })
            }
         })
    res.status(200).json({ message: "Get courses"  , course : courseData , nextPage , previousPage});
  },
];
export const getCourseByCoursePagination =  [ 
     query("cursor" , "cursor must be a positive integer").optional().isInt({ gt: 0 }),
    query("limit" , "limit must be a positive integer greater than 4").optional().isInt({ gt : 4 }).withMessage("Limit must be greater than 4").toInt(),
    async (
  req: Request,
  res: Response,
  next : NextFunction
) => {
 
    const error = validationResult(req).array({onlyFirstError : true}); 

     if (error.length > 0) {
       return next(new Error(error[0]?.msg || "Invalid ID"));
     } 
   
     const latestcursur = req.query.cursor;
     const limit = req.query.limit || 5;

     const userId = (req as any).user?.id;
     const user = await getUserById(userId);
     await checkUserIfNotExit(user);  

     
      const option = {
      take : +limit + 1 ,
       skip : latestcursur ? 1 : 0,
       cursor: latestcursur ? { id: +latestcursur } : undefined,
      select : {
        id : true , 
        title : true ,
        description : true ,
        imageUrl : true ,
        category :  {
            select : {
                name : true
            }
        } ,
       teacher: {
      select: { // <--- ဒီ select ကို မဖြစ်မနေ ထည့်ပေးရပါမယ်
        profile: {
          select: { // <--- profile အတွက်လည်း select ထပ်ထည့်ပေးရပါမယ်
            fullName: true,
            avatarUrl: true
          }
        }
      }
    },
        chapters : true ,
        updatedAt : true ,
      } ,
       orderBy : {
        updatedAt : "asc"
       }
     }  

   const cacheKey = `courses:${JSON.stringify(req.query)}` ;
          const courses = await getOrCache(cacheKey, async() => await getCourseByCoursePaginationData(option) );
           const courseData = courses.map((c : any) => {
            return {
                id: c.id,
                title: c.title,
                description: c.description,
                imageUrl: c.imageUrl,
                category: c.category.name,
                fullName: c.teacher.profile.fullName,
                avatarUrl: c.teacher.profile.avatarUrl,
                chapters: c.chapters,
                updatedAt: new Date(c.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })
            }
         })
          const nextPage = courses.length > +limit ; 
    if (nextPage) {
        courses.pop();
    } 
    const newCursor = courses.length > 0 ? courses[courses.length - 1]!.id : null;

  res.status(200).json({ message: "Get course by course" , course : courseData , newCursor , nextPage });
}];


export const getCourseByOwner = async (req : Request , res : Response , next : NextFunction) => {
   const userId = (req as any).user?.id;
     const user = await getUserById(userId);
     await checkUserIfNotExit(user);   

     const courses = await  getOwnCourseDataByTeacherId(userId )  
     const courseData = courses.map((c : any) => {
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category.name,
        imageUrl : c.imageUrl ,
        fullName: c.teacher.profile.fullName,
        avatarUrl: c.teacher.profile.avatarUrl,
        updatedAt: new Date(c.updatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      }
     }) 
     
     res.status(200).json({message : "Get course by owner" , course : courseData})
}