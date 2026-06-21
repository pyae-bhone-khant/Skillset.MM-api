import type { NextFunction, Request, Response } from "express";
import { param, query, validationResult } from "express-validator";
import { getUserById } from "../../src/services/user.js";
import { checkUserIfNotExit } from "../utils/user.js";
import { getBlogById } from "../services/blog.js";
import { checkBlogIfNotExit } from "../utils/blogs.js";
import { getBlogByPaginationData } from "../services/blog.js";

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
        category: blog!.category.name,
        fullName: blog!.author.profile?.fullName ,
        updatedAt: blog!.updatedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }

    res.json({ message: "Get one blog",  blog: blogPost });
  }
];

export  const getBlogByPagination  : any[] = [
    query("page").optional().isInt({ gt: 0 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ gt: 4 }).withMessage("Limit must be greater than 4"),

  async (req: CustomRequest, res: Response, next: NextFunction) => { 

     const error = validationResult(req).array({onlyFirstError : true});
     if (error.length > 0) {
       return next(new Error(error[0]?.msg || "Invalid ID"));
     }

     const page = req.query.page || 1;
     const limit = req.query.limit || 5;
   
     const userId = (req as any).user?.id;
     const user = await getUserById(userId);
     await checkUserIfNotExit(user); 

     const skip = (+page -1 )* +limit;
     const options = {
        skip,
        take: +limit + 1 ,
        select: {
            id: true,
            title: true,
            content: true,
            category:  {
                select: {
                    name: true
                }
            },
            author: {
                select: {
                    profile: {
                        select: {
                            fullName: true
                        }
                    }
                }
            },
            updatedAt: true
        },
        orderBy: {
            updatedAt: "desc"
        }
        
     } 
    
    const blogs = await getBlogByPaginationData(options); 
    const hasNextPage = blogs.length > +limit; 
    let nextPage = null;
    let previousPage = +page !== 1 ? +page - 1 : null;
    if (hasNextPage) {
        blogs.pop();
        nextPage = +page + 1;
    }
    const blogPosts = blogs.map((blog: any) => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        category: blog.category.name,
        fullName: blog.author?.profile?.fullName ?? "Unknown Author",
        updatedAt: blog.updatedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }));
    
    res.json({ message: "Get blogs" , blogs: blogPosts  , nextPage , previousPage });
  }
];


export const   getBlogByCursurPagination : any[] = [ 
    query("cursor" , "cursor must be a positive integer").optional().isInt({ gt: 0 }),
    query("limit" , "limit must be a positive integer greater than 4").optional().isInt({ gt : 4 }).withMessage("Limit must be greater than 4").toInt(),
    async ( req: CustomRequest, res: Response, next: NextFunction) => { 
    const error = validationResult(req).array({onlyFirstError : true}); 

     if (error.length > 0) {
       return next(new Error(error[0]?.msg || "Invalid ID"));
     } 
   
     const latestcursur = req.query.cursor;
     const limit = req.query.limit || 5;

     const userId = (req as any).user?.id;
     const user = await getUserById(userId);
     await checkUserIfNotExit(user); 

     const options = {
       take : +limit + 1 ,
       skip : latestcursur ? 1 : 0,
       cursor: latestcursur ? { id: +latestcursur } : undefined,
        select: {
            id: true,
            title: true,
            content: true,
            category: {
                select: {
                    name: true
                }
            },
            author: {
                select: {
                    profile: {
                        select: {
                            fullName: true
                        }
                    }
                }
            },
            updatedAt: true
        },
        orderBy: {
            updatedAt: "asc"
        }
        
     }  
     const blogs = await getBlogByPaginationData(options); 
     const blogPosts = blogs.map((blog: any) => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        category: blog.category.name,
        fullName: blog.author?.profile?.fullName ?? "Unknown Author",
        updatedAt: blog.updatedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    })); 
    const nextPage = blogs.length > +limit ; 
    if (nextPage) {
        blogs.pop();
    } 
    const newCursor = blogs.length > 0 ? blogs[blogs.length - 1]!.id : null;
    
    res.json({ message: "Get blogs" , blogs: blogPosts  , nextPage , newCursor  });
  }
];


