import express from 'express'
import { acceptConnectionRequest, discoverUsers, followUser, getUserConnections, getUserData, getUserProfiles, sendConnectionRequest, unfollowUser, updateUserData } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../config/multer.js';
import { getUserRecentMessages } from '../controllers/messageController.js';
import { syncUser } from '../middlewares/syncUser.js';

const userRouter = express.Router();

userRouter.get('/data', syncUser, protect, getUserData)
userRouter.post('/update', upload.fields([{name: 'profile', maxCount: 1}, {name: 'cover', maxCount:1}]), syncUser, protect, updateUserData)
userRouter.post('/discover', syncUser, protect, discoverUsers)
userRouter.post('/follow', syncUser, protect, followUser)
userRouter.post('/unfollow', syncUser, protect, unfollowUser)
userRouter.post('/connect', syncUser, protect, sendConnectionRequest)
userRouter.post('/accept', syncUser, protect, acceptConnectionRequest)
userRouter.get('/connections', syncUser, protect, getUserConnections)
userRouter.post('/profiles', getUserProfiles)
userRouter.get('/recent-messages', syncUser, protect, getUserRecentMessages)

export default userRouter