export const checkBlogIfNotExit = (blog: any) => {
    if (!blog) {
        throw new Error("Blog not found");
    }
}