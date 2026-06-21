
import { prisma } from "../lib/prisma.js";

export const getBlogById = (blogId: number) => {
    return prisma.blog.findUnique({
        where: {
            id: blogId
        } ,
        select: {
            id: true,
            title: true,
            content: true,
            category: {
                select: {
                    name: true
                }
            },
            authorId: true,
            author: {
                select: {
                    profile : {
                        select: {
                            fullName: true
                        }
                    }
                }
            },
            updatedAt: true
        }
         
    })
} 

export const getBlogByPaginationData = (options : any) => {
    return prisma.blog.findMany(options)
}