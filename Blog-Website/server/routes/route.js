import express from 'express';

import { createPost, updatePost, deletePost, getPost, getAllPosts } from '../controller/post-controller.js';
import { uploadImage, getImage } from '../controller/image-controller.js';
import { newComment, getComments, deleteComment } from '../controller/comment-controller.js';
import { loginUser, singupUser, logoutUser } from '../controller/user-controller.js';
import { authenticateToken, createNewToken } from '../controller/jwt-controller.js';

// Import validators and rate limiters
import { signupValidators, loginValidators, logoutValidator } from '../utils/auth-validators.js';
import { loginRateLimiter, signupRateLimiter, tokenRateLimiter } from '../utils/rate-limiters.js';

import upload from '../utils/upload.js';

const router = express.Router();

// Auth routes with validators and rate limiters
router.post('/login', loginRateLimiter, loginValidators, loginUser);
router.post('/signup', signupRateLimiter, signupValidators, singupUser);
router.post('/logout', logoutValidator, logoutUser);

router.post('/token', tokenRateLimiter, createNewToken);

// Content routes
router.post('/create', authenticateToken, createPost);
router.put('/update/:id', authenticateToken, updatePost);
router.delete('/delete/:id', authenticateToken, deletePost);

router.get('/post/:id', authenticateToken, getPost);
router.get('/posts', authenticateToken, getAllPosts);

router.post('/file/upload', upload.single('file'), uploadImage);
router.get('/file/:filename', getImage);

router.post('/comment/new', authenticateToken, newComment);
router.get('/comments/:id', authenticateToken, getComments);
router.delete('/comment/delete/:id', authenticateToken, deleteComment);

export default router;