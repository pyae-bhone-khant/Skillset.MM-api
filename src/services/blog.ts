
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
            category: true,
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