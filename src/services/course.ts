import { prisma } from "../lib/prisma.js";

export const getCourseByCoursePaginationData = (option : any) => {
      return prisma.course.findMany(option) 
} 


export const getOwnCourseDataByTeacherId = (userId : string) => {
  return prisma.course.findMany({
    where : {
      teacherId : userId
    } ,
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
  })
}

export const createCourseData = (courseData : any) => {
    return prisma.course.create({
      data  :  {
            title : courseData.title ,
            description : courseData.description,
            imageUrl : courseData.imageUrl,
            publicId : courseData.publicId,
            category : {
              connect : {
                id : courseData.categoryId
              }
            },
            teacher : {
              connect : {
                id : courseData.teacherId
              }
            }
      }
    })
} 

export const updateCourseData = (id : any , data : any) => {
  return prisma.course.update({
    where: {
      id
    },
    data: {
      ...data
    }
  })
} 

export const getCourseById = (courseId : number) => {
    return prisma.course.findUnique({
        where: {
            id : courseId
        } , 
        select : {
           publicId : true , 
           imageUrl : true
        }  
    })
}