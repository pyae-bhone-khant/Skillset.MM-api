import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import router from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import blogRouter from "./routes/blog.js";

export const app = express();

app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["*"],
  // credentials: true, // ဒါက အရေးကြီးဆုံးပါ
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/auth", router);
app.use("/api/v1",  profileRouter);
app.use("/api/v1",  blogRouter);



app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Server Error";
  const errorCode = error.code || "Error_Code";
  res.status(status).json({ message, error: errorCode });
});