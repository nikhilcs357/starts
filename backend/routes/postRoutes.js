import express from 'express';
import { upload } from '../config/multer.js';
import { protect } from '../middlewares/auth.js';
import { addpost, getFeedPosts, likePost } from '../controllers/PostController.js';


const PostRouter = express.Router()

PostRouter.post('/add', upload.array('images',4), protect, addpost)
PostRouter.get('/feed',protect, getFeedPosts)
PostRouter.post('/like', protect,likePost)

export default PostRouter