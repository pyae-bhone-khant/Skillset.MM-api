import type { NextFunction, Request, Response } from "express";
import { param, validationResult } from "express-validator";
import { getUserById } from "../../src/services/user.js";
import { checkUserIfNotExit } from "../utils/user.js";
import { getBlogById } from "../services/blog.js";
import { checkBlogIfNotExit } from "../utils/blogs.js";

interface CustomRequest extends Request {
   userId : string; 
}

export const getOneBlog  : any[] = [
  param("id").isInt({ gt: 0 }).withMessage("ID must be an integer"),
  async (req: CustomRequest, res: Response, next: NextFunction) => { 
     const error = validationResult(req).array({onlyFirstError : true});
     if (error.length > 0) {
       return next(new Error(error[0]?.msg || "Invalid ID"));
     }
     
    const blogId = parseInt(req.params.id as string, 10);
    const userId = (req as any).user?.id;
    const user = await getUserById(userId);
    await checkUserIfNotExit(user);

    const blog  = await getBlogById(blogId);
    await checkBlogIfNotExit(blog);

    const blogPost = {
        id: blog!.id,
        title: blog!.title,
        content: blog!.content,
        category: blog!.category,
        fullName: blog!.author?.profile?.fullName ,
        updatedAt: blog!.updatedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }



    res.json({ message: "Get one blog",  blog: blogPost });
  }
];
