
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

export const deleteBlogById = (blogId: number) => {
    return prisma.blog.delete({
        where: {
            id: blogId
        }
    })
} 

export const updateBlog = (blogId: number, data: any) => {
    return prisma.blog.update({
        where: {
            id: blogId
        },
        data : {
            title : data.title,
            content : data.content,
            categoryId : data.categoryId
        }
    })
}  

export const createBlogPost = async (data:  {
   title: string,
    content: string,
    categoryName: string, // ID အစား Name ကို လက်ခံမယ်
    authorId: string
}) => {
    const category = await prisma.category.findUnique({
        where: { name: data.categoryName }
    })

    if (!category) {
        throw new Error(`Category with name "${data.categoryName}" not found`)
    }

    return prisma.blog.create({
        data : {
            title: data.title,
            content: data.content,
            authorId: data.authorId,
            categoryId: category.id
        }
    })
} 

export const getCategoryDataByName = (categoryName: string) => {
    return prisma.category.findUnique({
        where: {
            name : categoryName
        }
    })
} 