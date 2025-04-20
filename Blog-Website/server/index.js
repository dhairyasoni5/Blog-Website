import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';

//components
import Connection from './database/db.js';
import Router from './routes/route.js';

// Load appropriate environment variables
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: './.env.test' });
} else {
  dotenv.config();
}

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'https://blog-website-frontend-lake.vercel.app',
  'https://blog-website-frontend-2yy2volty-dhairyasoni5s-projects.vercel.app'
];

// Add logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    origin: req.headers.origin,
    url: req.url
  });
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request with no origin');
      return callback(null, true);
    }
    
    // Remove trailing slash if present
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    
    console.log('Checking origin:', normalizedOrigin);
    
    if (allowedOrigins.some(allowed => allowed === normalizedOrigin)) {
      console.log('Origin allowed:', normalizedOrigin);
      return callback(null, true);
    }
    
    console.log('Origin not allowed:', normalizedOrigin);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // Cache preflight request for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('CORS Error:', err);
  if (err.message.includes('CORS policy')) {
    res.status(403).json({
      msg: 'Access denied by CORS policy',
      error: err.message
    });
  } else {
    next(err);
  }
});

// Request parsing
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', Router);

const PORT = process.env.PORT || 8000;

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  Connection(); // Call without parameters
  app.listen(PORT, () => console.log(`Server is running successfully on PORT ${PORT}`));
} else {
  // In test mode, don't start the server automatically
  // It will be managed by the test runner
}

// Export for testing
export default app;