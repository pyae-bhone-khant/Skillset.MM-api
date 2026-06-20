import { prisma } from "../lib/prisma.js";


export const getUserByEmail = (email: string) => {
    return prisma.user.findUnique({
        where: {
            email
        } ,
        include: {
            profile: true
        }
    });  
};

export const createUser = (UserData: any ) => {
    return prisma.user.create({
        data: {
            email: UserData.email,
            password: UserData.password,
            profile : {
                create: {
                    fullName: UserData.name
                }
            }         
        },       
    });
}; 

export const getUserById = (id: string) => { 
    return prisma.user.findUnique({
        where: {
            id
        },
        include: {
            profile: true
        }
    });
}