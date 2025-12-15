import express from 'express'
import { getChatMessages, sendMessage, sseController, getConversations } from '../controllers/messageController.js';
import { upload } from '../config/multer.js';
import { protect } from '../middlewares/auth.js';


const messageRouter = express.Router();

messageRouter.get('/:userId', sseController)
messageRouter.post('/send', upload.single('image'), protect, sendMessage)
messageRouter.post('/get', protect, getChatMessages)
messageRouter.get('/conversations', protect, getConversations)

export default messageRouter