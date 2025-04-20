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
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://blog-website-client.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 24 hours
}));

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