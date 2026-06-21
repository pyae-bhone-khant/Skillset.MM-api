export const checkBlogIfNotExit = (blog: any) => {
    if (!blog) {
        throw new Error("Blog not found");
    }
}

export const checkCategoryIfNotExit = (category: any) => {
    if (!category) {
        throw new Error("Category not found");
    }
}