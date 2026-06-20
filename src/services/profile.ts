import { prisma } from "../lib/prisma.js";

interface ProfileData {
    fullName: string;
    bio?: string;
    imageUrl?: string;
    category?: string;
}

export const updateUserProfile = (userId: string, profileData: ProfileData) => {
    const { fullName, bio, imageUrl, category } = profileData;
    return prisma.profile.upsert({
        where: {
            userId: userId
        },
        update: {
            fullName: fullName,
            bio: bio,
            imageUrl: imageUrl,
            category: category
        },
        create: {
            userId: userId,
            fullName: fullName,
            bio: bio,
            imageUrl: imageUrl,
            category: category
        }
    });
};
