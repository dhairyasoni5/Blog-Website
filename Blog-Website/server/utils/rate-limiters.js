import rateLimit from 'express-rate-limit';

// Rate limiter for login attempts to prevent brute force attacks
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP in the windowMs time
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter for signup attempts
export const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 account creations per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: 'Too many accounts created from this IP, please try again after an hour'
  },
});

// Rate limiter for refresh token requests
export const tokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 token refreshes per IP in 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: 'Too many token refresh attempts from this IP, please try again after 15 minutes'
  },
}); 