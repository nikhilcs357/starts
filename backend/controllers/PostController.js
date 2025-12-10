import fs from "fs";
import imagekit from "../config/imagekit.js";    
import Post from "../models/post.js";            
import User from "../models/User.js";            

// Add Post
export const addpost = async (req, res) => {
  try {
    const { userId } = req.auth;;
    const { content, post_type } = req.body;
    const images = req.files;

    let image_urls = [];

    if (images && images.length) {
      image_urls = await Promise.all(
        images.map(async (Image) => {
          const fileBuffer = fs.readFileSync(Image.path);

          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: Image.originalname,
            folder: "posts",
          });

          // FIX: changed ImageKit.url → imagekit.url
          const url = imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" },
            ],
          });

          return url;
        })
      );
    }

    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });

    res.json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// get post
export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = req.auth;;
    const me = await User.findById(userId);   

    const userIds = [userId, ...me.connections, ...me.following];

    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });  
  }
};

// Like Post
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth;;
    const { postId } = req.body;

    const post = await Post.findById(postId);

    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter((id) => id !== userId);
      await post.save();
      return res.json({ success: true, message: "post unliked" });
    } else {
      post.likes_count.push(userId);
      await post.save();
      return res.json({ success: true, message: "post liked" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });  
  }
};
