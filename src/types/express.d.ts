// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      // Define the structure of your decoded JWT here
      user?: string | JwtPayload; 
    }
  }
}