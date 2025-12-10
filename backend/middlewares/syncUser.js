import User from '../models/User.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const clerkSDK = require('@clerk/clerk-sdk-node');


const clerk = clerkSDK.createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const syncUser = async (req, res, next) => {
  try {
    console.log('Entering syncUser middleware');
    const { userId } = req.auth;

    if (!userId) {
      console.log('No userId, returning 401');
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    console.log('userId:', userId);
    let user = await User.findById(userId);
    console.log('user from DB:', user);

    if (!user) {
      console.log('User not found in DB, fetching from Clerk');
      const clerkUser = await clerk.users.getUser(userId);
      console.log('clerkUser:', clerkUser);

      const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
      console.log('email:', email);
      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      console.log('fullName:', fullName);
      let username = email.split('@')[0];
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = username + Math.floor(Math.random() * 10000);
      }
      console.log('username:', username);


      user = await User.create({
        _id: userId,
        email: email,
        full_name: fullName,
        username: username,
        profile_picture: clerkUser.imageUrl,
      });
      console.log('user created in DB:', user);
    }

    console.log('Calling next()');
    next();
  } catch (error) {
    console.error('Error in syncUser middleware:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
