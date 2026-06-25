import type { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { validationResult } from "express-validator";
import { getUserById } from "../../services/user.js";
import { checkUserIfNotExit } from "../../utils/user.js";
import { getOrCache } from "../../lib/cache.js";
import {
  deleteUserById,
  getAllUsersByOption,
  updateDataById,
} from "../../services/admin.js";
import { prisma } from "../../lib/prisma.js";
import { cacheQueue } from "../../jobs/queue/cacheQueue.js";

interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

export const getAllUser: any = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id;

  const user = await getUserById(userId!);
  await checkUserIfNotExit(user);

  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  const skip = (+page - 1) * +limit;

  const option = {
    skip,
    take: +limit + 1,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      role: true,
      updatedAt: true,

      profile: {
        select: {
          fullName: true,
          avatarUrl: true,
        },
      },
    },
  };

  const cacheKey = `users:${JSON.stringify(req.query)}`;
  const users = await getOrCache(
    cacheKey,
    async () => await getAllUsersByOption(option),
  );
  const hasNextPage = users.length > +limit;
  let nextPage = null;
  let previousPage = +page !== 1 ? +page - 1 : null;
  if (hasNextPage) {
    users.pop();
    nextPage = +page + 1;
  } 

  const userList : any[] = users.map((u : any) => {
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      updatedAt: u.updatedAt,

      profile: {
        fullName: u.profile?.fullName,
        avatarUrl: u.profile?.avatarUrl,
      },
    };
  });

  res.status(200).json({
    success : true,
    message : "get all users successfully",
    user :  userList,
    nextPage,
    previousPage
  })
};

export const changeRole: any[] = [
  param("id", "id must be a  string").notEmpty().isString(),
  body("role", "role must be a string").isString().isIn(['ADMIN','STUDENT','TEACHER']),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const error = validationResult(req).array({ onlyFirstError: true });
    if (error.length > 0) {
      return next(new Error(error[0]?.msg || "Invalid ID"));
    }
    const id = req.params.id;
    const role = req.body.role;
    const user = await getUserById(req.user?.id!);
    await checkUserIfNotExit(user);

    const data = {
      role,
    };

    const updateData = await updateDataById(String(id), data);

    await cacheQueue.add(
      "delete-cache-users",
      {
        pattern: `users:*`,
      },
      {
        jobId: `invalidate ${Date.now()}`,
        priority: 1,
      },
    );

    res.status(200).json({
      success: true,
      message: "User role change successfully",
      RoleChaneUser : updateData
    });
  },
];

export const deleteUser: any = [
  param("id", "id must be a string").notEmpty().isString(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const error = validationResult(req).array({ onlyFirstError: true });
    if (error.length > 0) {
      return next(new Error(error[0]?.msg || "Invalid ID"));
    }
    const id = req.params.id;
    const user = await getUserById(req.user?.id!);
    await checkUserIfNotExit(user);

    const deleteUserData = await deleteUserById(String(id));

    await cacheQueue.add(
      "delete-cache-users",
      {
        pattern: `users:*`,
      },
      {
        jobId: `invalidate ${Date.now()}`,
        priority: 1,
      },
    );

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deleteUser : deleteUserData
    });
  },
];
