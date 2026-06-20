import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { use } from "react";
import { getUserById } from "../services/user.js";

// Define your roles
export enum Role {
  STUDENT ,
  TEACHER ,
  ADMIN 
}

// Define the payload structure
export interface UserPayload {
  id: string;
  role: Role;
} 

const isUser = (req: Request, res: Response, next: NextFunction) => {
  // 1. Get the token from the Authorization header
  // Expecting format: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // 2. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // 3. Attach the decoded user data to the request object
    req.user = decoded as any;
    
    // 4. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export default isUser;

export const isTeacher =  async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const user = req.user as UserPayload;
    if (!user) {
      return res.status(401).json({ message: 'Your not authenticated' });
    }

    const userData = await getUserById(user.id);
    if (!userData) {
      return res.status(401).json({ message: 'User not found' });
    } 
     
    if (userData.role as string !== "TEACHER" && userData.role as string !== "ADMIN") {
      return res.status(403).json({ message: 'Access denied. Only teachers and admin can access this resource.' });
    }
    
    // 4. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const user = req.user as UserPayload;

    if (!user) {
      return res.status(401).json({ message: 'Your not authenticated' });
    }

    const userData = await getUserById(user.id)
     if (!userData) {
      return res.status(401).json({ message: 'User not found' });
     }
    
    if (userData.role as string !== "ADMIN") {
      return res.status(403).json({ message: 'Access denied. Only admin can access this resource.' });
    }
    
    // 4. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
}; 



