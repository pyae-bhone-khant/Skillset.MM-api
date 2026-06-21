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
    console.log("Profile update request:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const userId = (req.user as any)?.id;
      const user = await getUserById(userId);
      const { fullName, bio, category } = req.body;
      const newImage = req.file;
      
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

     let imageUrl = user!.profile!.avatarUrl ;
     let publicId = user!.profile!.publicId ;

     if (newImage) {
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
      const result = await cloudinary.uploader.upload(newImage.path, {
        folder: 'skillsetmm/profiles' ,
        transformation: [{ 
          width: 400, 
          height: 400, 
          crop: 'fill' , 
          gravity: 'face' 
        },
        {
          quality: 'auto'
        },
        {
          fetch_format: 'auto'
        }
      ],
      });
      
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }
          
      const profileData = { fullName, bio, category , imageUrl , publicId };
      const profile = await updateUserProfile(userId, profileData);

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: user,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
];
 

export const getUserData = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const user = await getUserById(userId);
    res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Get user data error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};