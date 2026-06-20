export const checkUserExit = (user: any) => {
    if (user) {
        throw new Error("User already exists");
    }
} 

export const checkUserIfNotExit = (user: any) => {
    if (!user) {
        throw new Error("User not found");
    }
} 
