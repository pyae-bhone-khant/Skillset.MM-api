import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { getUserById } from "../services/user.js";
import { updateUserProfile } from "../services/profile.js";
import { v2 as cloudinary } from 'cloudinary';


// Cloudinary ကို တစ်ခါတည်း Config လုပ်ထားပါ
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
});

export const updateProfile = [
  // Validation rules
  body("fullName").optional().notEmpty().withMessage("Full name cannot be empty"),
  body("bio").optional().isString(),
  body("category").optional().isString(),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const userId = (req.user as any)?.id;
      const user = await getUserById(userId);
      
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const { fullName, bio, category } = req.body;
      
      // Upload new image to Cloudinary if file is provided
      let imageUrl = (user.profile as any)?.imageUrl || null;

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "profiles",
        });
        imageUrl = result.secure_url;
      }

      const profileData = { fullName, bio, imageUrl, category };
      const profile = await updateUserProfile(userId, profileData);

      res.json({
        success: true,
        message: "Profile updated successfully",
        profile
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
];
