import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import router from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import blogRouter from "./routes/blog.js";
import courseRouter from "./routes/course.js";
import courseTeacherRouter from "./routes/teacher/course.js";
import capterRoute from "./routes/chapter.js";
import capterTeacherRoute from "./routes/teacher/chapter.js";
import categoryRouter from "./routes/admin/category/category.js";
import adminRouter from "./routes/admin/admin.js";
export const app = express();

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "https://skillset-mm-app.vercel.app" ||
      "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// for local 
// app.set("trust proxy", 1);
// app.use(cors({
//   origin: ["http://localhost:3000", "http://localhost:5173"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE" , "OPTIONS"], 

// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", router);
app.use("/api/v1", profileRouter);
app.use("/api/v1", blogRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", courseTeacherRouter);
app.use("/api/v1", capterRoute);
app.use("/api/v1", capterTeacherRoute);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", adminRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Server Error";
  const errorCode = error.code || "Error_Code";
  res.status(status).json({ message, error: errorCode });
});
