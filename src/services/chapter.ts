import { prisma } from "../lib/prisma.js";

export const getChapterByCourseId = (option : any) => {
    return prisma.chapter.findMany({
       ...option
    })
}
 
export const createChapterData = async (courseId : number, data : any)=> {
  return await prisma.chapter.create({
    data : {
      ...data,
      course : {
        connect : {
          id  : courseId
        }
      }
    }
  })
} 

export const updateChapterData = async (courseId : number , capterId : number , data : any)=> {
    return await prisma.chapter.update({
        where : {
            id : capterId,
            courseId : courseId
        },
        data : data,
    })
}

export const deleteChapterData = async (courseId : number , capterId : number)=> {
    return await prisma.chapter.delete({
        where : {
            id : capterId,
            courseId : courseId
        }
    })
}

export const  fineCapcter = (option : any) => {
    return prisma.chapter.findFirst({
        ...option
    })
} 
