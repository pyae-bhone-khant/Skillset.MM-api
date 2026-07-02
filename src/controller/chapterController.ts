import type { Request, Response, NextFunction } from "express";
import { param } from "express-validator";
import { validationResult } from "express-validator";
import { getUserById } from "../services/user.js";
import { checkUserIfNotExit } from "../utils/user.js";
import { getCourseById } from "../services/course.js";
import { getChapterByCourseId } from "../services/chapter.js";
import { getOrCache } from "../lib/cache.js";

export const getChapterAll = [
  param("id", "id must be a number").isInt({ gt: 0 }).toInt(),
  async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req).array({ onlyFirstError: true });
    if (error.length > 0) {
      return next(new Error(error[0]?.msg || "Invalid ID"));
    }
    const id = parseInt(req.params.id as string, 10);
    const userId = (req as any).user?.id;
    const user = await getUserById(userId);
    await checkUserIfNotExit(user);

    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (+page - 1) * +limit;

    const option = {
      skip,
      take: +limit + 1,
      where: {
        courseId: id,
      },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        sortingNo: true,
        updatedAt: true,

        course: {
          select: {
            teacher: {
              select: {
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        sortingNo: "desc",
      },
    };

    const cacheKey = `chapters:${id}:${JSON.stringify(req.query)}`;
    const chapters = await getOrCache(
      cacheKey,
      async () => await getChapterByCourseId(option),
    );
    const hasNextPage = chapters.length > +limit;
    let nextPage = null;
    let previousPage = +page !== 1 ? +page - 1 : null;
    if (hasNextPage) {
      chapters.pop();
      nextPage = +page + 1;
    }

    const chapterData = chapters.map((c: any) => {
      return {
        id: c.id,
        title: c.title,
        videoUrl: c.videoUrl,
        sortingNo: c.sortingNo,
        fullName: c.course.teacher.profile.fullName,
        avatarUrl: c.course.teacher.profile.avatarUrl,
        updatedAt: new Date(c.updatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
    });

    res
      .status(200)
      .json({
        message: "Get chapter all",
        chapter: chapterData,
        nextPage,
        previousPage,
      });
  },
];

export const getChapterByCusurPagelitaion = [
  param("id", "id must be a number").isInt({ gt: 0 }).toInt(),
  async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req).array({ onlyFirstError: true });
    if (error.length > 0) {
      return next(new Error(error[0]?.msg || "Invalid ID"));
    }
    const id = parseInt(req.params.id as string, 10);
    const userId = (req as any).user?.id;
    const user = await getUserById(userId);
    await checkUserIfNotExit(user);

    const page = req.query.page || 1;

    const latestcursur = req.query.cursor;
    const limit = req.query.limit || 5;

    const option = {
      take: +limit + 1,
      skip: latestcursur ? 1 : 0,
      cursor: latestcursur ? { id: +latestcursur } : undefined,
      where: {
        courseId: id,
      },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        sortingNo: true,
        updatedAt: true,

        course: {
          select: {
            teacher: {
              select: {
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        sortingNo: "asc",
      },
    };

    const cacheKey = `chapters:${id}:${JSON.stringify(req.query)}`;
    const chapters = await getOrCache(
      cacheKey,
      async () => await getChapterByCourseId(option),
    );
    const chapterData = chapters.map((c: any) => {
      return {
        id: c.id,
        title: c.title,
        videoUrl: c.videoUrl,
        sortingNo: c.sortingNo,
        fullName: c.course.teacher.profile.fullName,
        avatarUrl: c.course.teacher.profile.avatarUrl,
        updatedAt: new Date(c.updatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
    });

    const nextPage = chapters.length > +limit;
    if (nextPage) {
      chapters.pop();
    }
    const newCursor =
      chapters.length > 0 ? chapters[chapters.length - 1]!.id : null;

    res
      .status(200)
      .json({ message: "Get chapter all", chapter: chapterData, newCursor });
  },
];
