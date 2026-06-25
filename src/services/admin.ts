import { prisma } from "../lib/prisma.js";

export const getAllUsersByOption = async (option: any) => {
  try {
    return await prisma.user.findMany(option);
  } catch (error) {
    throw error;
  }
};

export const updateDataById = async (id: string , data: any) => {
    try {
        return await prisma.user.update({
            where: {
                id,
            },
            data: {
               role : data.role
            },
        });
    } catch (error) {
        throw error;
    }
};

export const deleteUserById = async (id: string) => {
    try {
        return await prisma.user.delete({
            where: {
                id,
            },
        });
    } catch (error) {
        throw error;
    }
};
