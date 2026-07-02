import type { NextFunction, Request, Response } from "express";
import { body , validationResult } from "express-validator";
import { createUser, getUserByEmail } from "../services/user.js";
import { checkUserExit, checkUserIfNotExit } from "../utils/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { getOrCache } from "../lib/cache.js";

export const register =  [
body("email").isEmail().withMessage("Invalid email"),
body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
body("name").notEmpty().withMessage("Name is required"),

async (req: Request, res: Response , next : NextFunction) => {
  
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
       return res.status(400).json({
           success: false,
           message: "Validation failed",
           errors: errors.array()
       });
   } 

   const { email, password, name } = req.body;
   if (!email || !password || !name) {
       return res.status(400).json({
           success: false,
           message: "Email, password and name are required"
       });
   } 

   const user =  await getUserByEmail(email);
    await checkUserExit(user) 

    const salt  = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
        email,
        password: hashedPassword,
        name
    } 
    // await createUser(userData);
     const cacheKey = `users:`;
      const categories = await getOrCache(
        cacheKey,
        async () => await createUser(userData),
      );
     
    res.status(200).json({
        success: true,
        message: "Register",
        user: userData
    });
}]

export const login =  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    async (req: Request, res: Response , next : NextFunction) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }  
   const { email, password } = req.body;
   if (!email || !password) {
       return res.status(400).json({
           success: false,
           message: "Email and password are required"
       });
   }  

   const user = await getUserByEmail(email);
     await checkUserIfNotExit(user) ; 

     const isPasswordValid = await bcrypt.compare(password, user!.password);
     if (!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid password"
        });
     } 

     // TODO: Generate token 
     const token = generateToken(user!.id, res);

    res.status(200).json({
        success: true,
        message: "Login",
        token ,
        user: user
    });
}]

export const logout = (req: Request, res: Response , next : NextFunction) => {
       
    res.clearCookie("token");
     res.cookie("jwt" , "" , {
    httpOnly : true ,
    expires : new Date(0)
   })
    res.status(200).json({
        success: true,
        message: "Logout"
    });
}
