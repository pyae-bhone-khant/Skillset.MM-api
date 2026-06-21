import { prisma } from "../lib/prisma.js";


export const updateUserProfile = (userId: string, profileData: any) => {
   return prisma.profile.update({
    where: {
        userId: userId
    },
    data: {
        fullName: profileData.fullName,
        bio: profileData.bio,
        category: profileData.category,
        avatarUrl: profileData.imageUrl,
        publicId: profileData.publicId,
    }
   })
};
