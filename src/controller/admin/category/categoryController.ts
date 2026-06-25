import type { Request, Response, NextFunction } from "express";
import { body, validationResult, param } from "express-validator";
import { getUserById } from "../../../services/user.js";
import { checkUserIfNotExit } from "../../../utils/user.js";
import { prisma } from "../../../lib/prisma.js";
import { getOrCache } from "../../../lib/cache.js";
import { cacheQueue } from "../../../jobs/queue/cacheQueue.js";

interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

export const createCategory: any[] = [
  body("name").trim().notEmpty().withMessage("Category name is required"),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const error = validationResult(req).array({ onlyFirstError: true });
    if (error.length > 0) {
      return next(new Error(error[0]?.msg || "Invalid ID"));
    }

    const userId = req.user?.id;
    const user = await getUserById(userId!);
    await checkUserIfNotExit(user);

    const name = req.body.name;

    const category = await prisma.category.create({
      data: {
        name,
      },
    });

    await cacheQueue.add(
      "delete-cache-courses",
      {
        pattern: `categories`,
      },
      {
        jobId: `invalidate ${Date.now()}`,
        priority: 1,
      },
    );

    res
      .status(201)
      .json({
        success: true,
        message: "category create successfully",
        category,
      });
  },
];

export const getAllCategories = async (req: any, res: any) => {
  const userId = req.user?.id;
  const user = await getUserById(userId!);
  await checkUserIfNotExit(user);

  const cacheKey = `categories`;
  const categories = await getOrCache(
    cacheKey,
    async () => await prisma.category.findMany(),
  );

  res.status(200).json({ success: true, categories });
};

export const deleteCategory: any[] = [
  param("id").isInt({ gt: 0 }).withMessage("Invalid ID").toInt(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const error = validationResult(req).array({ onlyFirstError: true });
    if (error.length > 0) {
      return next(new Error(error[0]?.msg || "Invalid ID"));
    }

    const userId = req.user?.id;
    const user = await getUserById(userId!);
    await checkUserIfNotExit(user);

    const id = parseInt(req.params.id as string, 10);

    const deleteData = await prisma.category.delete({
      where: {
        id,
      },
    });

    if (!deleteData) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    await cacheQueue.add(
      "delete-cache-courses",
      {
        pattern: `categories`,
      },
      {
        jobId: `invalidate ${Date.now()}`,
        priority: 1,
      },
    );

    res
      .status(200)
      .json({
        success: true,
        message: "category delete successfully",
        deleteData,
      });
  },
];

export const updateCategory: any[] = [
  param("id").isInt({ gt: 0 }).withMessage("Invalid ID").toInt(),
  body("name").trim().notEmpty().withMessage("Category name is required"),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const error = validationResult(req).array({ onlyFirstError: true });
    if (error.length > 0) {
      return next(new Error(error[0]?.msg || "Invalid ID"));
    }

    const userId = req.user?.id;
    const user = await getUserById(userId!);
    await checkUserIfNotExit(user);

    const id = parseInt(req.params.id as string, 10);
    const name = req.body.name;

    const updateData = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    if (!updateData) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    await cacheQueue.add(
      "delete-cache-courses",
      {
        pattern: `categories`,
      },
      {
        jobId: `invalidate ${Date.now()}`,
        priority: 1,
      },
    );
    res
      .status(200)
      .json({
        success: true,
        message: "category update successfully",
        updateData,
      });
  },
];
