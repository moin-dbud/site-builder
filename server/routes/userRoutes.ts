import express from 'express';
import { checkUsername, createUserProject, getCurrentUserStatus, getUserCredits, getUserProject, getUserProjects, getUserProfile, getUserTransactions, purchaseCredits, sendEmailOtp, setInitialUsername, togglePublish, verifyEmailOtp } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.get('/check-username', checkUsername);
userRouter.get('/profile/:username', getUserProfile);
userRouter.get('/me', protect, getCurrentUserStatus);
userRouter.get('/transactions', protect, getUserTransactions);
userRouter.post('/send-otp', protect, sendEmailOtp);
userRouter.post('/verify-otp', protect, verifyEmailOtp);
userRouter.post('/set-username', protect, setInitialUsername);
userRouter.get('/credits',protect, getUserCredits)
userRouter.post('/project', protect, createUserProject)
userRouter.get('/project/:projectId',protect, getUserProject)
userRouter.get('/projects',protect, getUserProjects)
userRouter.get('/publish-toggle/:projectId',protect, togglePublish)
userRouter.post('/purchase-credits',protect, purchaseCredits)

export default userRouter