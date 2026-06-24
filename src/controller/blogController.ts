import type { NextFunction, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { getUserById } from "../../src/services/user.js";
import { checkUserIfNotExit } from "../utils/user.js";
import { createBlogPost, deleteBlogById, getBlogById, updateBlog } from "../services/blog.js";
import { checkBlogIfNotExit, checkCategoryIfNotExit } from "../utils/blogs.js";
import { getBlogByPaginationData , getCategoryDataByName } from "../services/blog.js";
import { getOrCache } from "../lib/cache.js";
import { cacheQueue } from "../jobs/queue/cacheQueue.js";


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
    
    const cacheKey = `blogs:${JSON.stringify(blogId)}`

    const blog  = await getOrCache(cacheKey , async () => await getBlogById(blogId)); 
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
     const cacheKey = `blogs:${JSON.stringify(req.query)}` ;
     const blogs = await getOrCache(cacheKey, async() => await getBlogByPaginationData(options)); 
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
     const cacheKey  = `blogs:${JSON.stringify(req.query)}`
    const blogs = await getOrCache(cacheKey , async() => {
        return await getBlogByPaginationData(options)
     })        
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

export const deleteBlog : any[] = [
    param("id" , "ID must be a positive integer").isInt({ gt: 0 }),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const error = validationResult(req).array({onlyFirstError : true}); 

        if (error.length > 0) {
            return next(new Error(error[0]?.msg || "Invalid ID"));
        } 

        const blogId = parseInt(req.params.id as string , 10);
        const userId = (req as any).user?.id;
        const user = await getUserById(userId);
        await checkUserIfNotExit(user); 

        const blog = await getBlogById(blogId);
        if (!blog) {
            return next(new Error("Blog not found"));
        }

        if (blog.authorId !== userId) {
            return next(new Error("You are not authorized to delete this blog"));
        }

        await deleteBlogById(blogId);
        await cacheQueue.add("delete-cache-blogs" , {
            pattern: `blogs:*`} ,
            {
                jobId : `invalidate ${Date.now()}` ,
                priority : 1 
            }

        );
        res.json({ message: "Blog deleted successfully" });
    }
]; 

export const getBlogByOwner : any[] = [
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        const user = await getUserById(userId);
        await checkUserIfNotExit(user); 
        
         
        const blogs = await getBlogByPaginationData({
            where: {
                authorId: userId
            },
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
        }); 
         if (!blogs || blogs.length === 0) {
            return next(new Error("you have no blogs"));
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

        res.json({ message: "Get blogs by owner", blogs: blogPosts });
    }
]; 


export const updateBlogByOwner : any[] = [
    body("title").optional().isString().withMessage("Title must be a string"),
    body("content").optional().isString().withMessage("Content must be a string"),
    body("category").optional().isString().withMessage("Category ID must be a string"),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const blogId = parseInt(req.params.id as string , 10);
        const userId = (req as any).user?.id;
        const user = await getUserById(userId);
        await checkUserIfNotExit(user); 

        const blog = await getBlogById(blogId);
        if (!blog) {
            return next(new Error("Blog not found"));
        }

        if (blog.authorId !== userId) {
            return next(new Error("You are not authorized to update this blog"));
        }


        const { title, content, category } = req.body; 
        const categoryData = await getCategoryDataByName(category);
        await checkCategoryIfNotExit(categoryData);  

        const data = {
            title,
            content,
            categoryId: categoryData?.id
        }
        await updateBlog(blogId, data); 
      
        await cacheQueue.add("delete-cache-blogs" , {
            pattern: `blogs:*`} ,
            {
                jobId : `invalidate ${Date.now()}` ,
                priority : 1 
            }
        );

        res.json({ message: "Blog updated successfully" });
    }
];  


export const createBlog : any[] = [
    body("title").isString().withMessage("Title must be a string"),
    body("content").isString().withMessage("Content must be a string"),
    body("category").isString().withMessage("Category must be a string"),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.id;
        const user = await getUserById(userId);
        await checkUserIfNotExit(user); 

        const { title, content, category } = req.body; 
        const data = {
            title ,
            content ,
            categoryName : category ,
            authorId : userId
        }
        await createBlogPost(data as any);
        await cacheQueue.add("delete-cache-blogs" , {
            pattern: `blogs:*`},
            {
                jobId : `invalidate ${Date.now()}` ,
                priority : 1 
            }
        );
        res.json({ message: "Blog created successfully" });
    }
];



