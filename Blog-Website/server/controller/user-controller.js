import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';

import Token from '../model/token.js'
import User from '../model/user.js';

dotenv.config();

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour expiry

// Helper function to create JWT tokens
const generateTokens = async (user) => {
  try {
    const payload = { id: user._id, username: user.username };
    
    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_SECRET_KEY
    );
    
    // Store refresh token in database
    const newToken = new Token({ token: refreshToken, user: user._id });
    await newToken.save();
    
    return {
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('Error generating tokens:', error);
    throw new Error('Error generating authentication tokens');
  }
};

export const singupUser = async (request, response) => {
  try {
    console.log('Signup attempt with data:', {
      username: request.body.username,
      name: request.body.name,
      // Don't log the actual password
      passwordLength: request.body.password ? request.body.password.length : 0
    });

    // Check for validation errors
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return response.status(400).json({ 
        msg: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: request.body.username });
    if (existingUser) {
      console.log('Username already exists:', request.body.username);
      return response.status(409).json({ 
        msg: 'Username already exists. Please choose another one.' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(request.body.password, SALT_ROUNDS);

    // Create new user
    const user = { 
      username: request.body.username, 
      name: request.body.name, 
      password: hashedPassword 
    };

    const newUser = new User(user);
    await newUser.save();
    console.log('User created successfully:', {
      username: user.username,
      name: user.name
    });

    return response.status(201).json({ 
      msg: 'Signup successful. You can now login with your credentials.' 
    });
  } catch (error) {
    console.error('Error in signup:', error);
    return response.status(500).json({ 
      msg: 'An error occurred during registration. Please try again later.' 
    });
  }
};

export const loginUser = async (request, response) => {
  try {
    // Check for validation errors
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ 
        msg: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Find user by username
    const user = await User.findOne({ username: request.body.username });
    
    // If user not found, return generic error message (for security)
    if (!user) {
      return response.status(401).json({ 
        msg: 'Invalid username or password' 
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(request.body.password, user.password);
    
    if (passwordMatch) {
      // Generate tokens
      const tokens = await generateTokens(user);
      
      // Return success response with tokens
      response.status(200).json({ 
        accessToken: tokens.accessToken, 
        refreshToken: tokens.refreshToken,
        name: user.name, 
        username: user.username 
      });
    } else {
      // Invalid password - return generic error (for security)
      response.status(401).json({ 
        msg: 'Invalid username or password' 
      });
    }
  } catch (error) {
    console.error('Error in login:', error);
    response.status(500).json({ 
      msg: 'An error occurred during login. Please try again later.' 
    });
  }
};

export const logoutUser = async (request, response) => {
  try {
    const token = request.body.token;
    
    if (!token) {
      return response.status(400).json({ msg: 'Refresh token is required' });
    }
    
    // Delete the refresh token
    const result = await Token.deleteOne({ token: token });
    
    if (result.deletedCount === 0) {
      return response.status(404).json({ msg: 'Token not found or already expired' });
    }
    
    response.status(200).json({ msg: 'Logout successful' });
  } catch (error) {
    console.error('Error in logout:', error);
    response.status(500).json({ msg: 'An error occurred during logout' });
  }
};