# Deployment Guide for Blog Website

This guide provides instructions for deploying the Blog Website application to production environments.

## Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- NPM or Yarn
- Git

## Local Testing

Before deployment, ensure all tests pass:

```bash
# Clone the repository if you haven't already
git clone <repository_url>
cd Blog-Website

# Make the test script executable
chmod +x run-tests.sh

# Run the tests
./run-tests.sh
```

## Server Deployment

### 1. Set Up MongoDB

You have two options:

**Option A: MongoDB Atlas (Recommended for production)**
1. Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database access (username and password)
4. Create a database named "blog-website"
5. Get your connection string

**Option B: Self-hosted MongoDB**
1. Install MongoDB on your server
2. Start MongoDB service
3. Create a database named "blog-website"

### 2. Deploy Backend

#### Option A: Deploy to Heroku
1. Create a Heroku account and install Heroku CLI
2. Navigate to the server directory
3. Create a Heroku app:
   ```bash
   heroku create your-blog-website-api
   ```
4. Set environment variables:
   ```bash
   heroku config:set PORT=8000
   heroku config:set DB_USERNAME=your_mongodb_username
   heroku config:set DB_PASSWORD=your_mongodb_password
   heroku config:set ACCESS_SECRET_KEY=your_access_secret_key
   heroku config:set REFRESH_SECRET_KEY=your_refresh_secret_key
   heroku config:set CLIENT_URL=https://your-frontend-url.com
   ```
5. Deploy:
   ```bash
   git subtree push --prefix server heroku master
   ```

#### Option B: Deploy to VPS (Digital Ocean, AWS, etc.)
1. SSH into your server
2. Clone the repository
3. Navigate to the server directory
4. Install dependencies:
   ```bash
   npm install --production
   ```
5. Create a .env file with the necessary environment variables:
   ```
   PORT=8000
   DB_USERNAME=your_mongodb_username
   DB_PASSWORD=your_mongodb_password
   ACCESS_SECRET_KEY=your_access_secret_key
   REFRESH_SECRET_KEY=your_refresh_secret_key
   CLIENT_URL=https://your-frontend-url.com
   ```
6. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start index.js --name blog-website-api
   pm2 startup
   pm2 save
   ```
7. Set up Nginx as a reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
8. Set up SSL with Let's Encrypt

## Client Deployment

### 1. Update API Endpoint

In `client/src/service/api.js`, update the API URL to your production backend URL.

### 2. Build the Client

```bash
cd client
npm install
npm run build
```

### 3. Deploy Client

#### Option A: Deploy to Netlify or Vercel
1. Connect your repository to Netlify/Vercel
2. Set the build command to `npm run build`
3. Set the publish directory to `build`
4. Set environment variables if needed

#### Option B: Deploy to VPS
1. Copy the build folder to your server
2. Set up Nginx to serve the static files:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /path/to/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
3. Set up SSL with Let's Encrypt

## Security Considerations

1. Generate strong, unique keys for `ACCESS_SECRET_KEY` and `REFRESH_SECRET_KEY`
2. Set up proper CORS configuration in production
3. Use HTTPS for all communications
4. Implement rate limiting and security headers (already implemented with helmet and express-rate-limit)
5. Regularly update dependencies

## Monitoring and Maintenance

1. Set up application monitoring (e.g., using New Relic, Datadog)
2. Set up error tracking (e.g., Sentry)
3. Configure log management
4. Set up automated backups for MongoDB
5. Implement a CI/CD pipeline for seamless updates

## Troubleshooting

If you encounter issues with user creation or authentication:
1. Check MongoDB connection
2. Verify environment variables are correctly set
3. Check server logs for detailed error messages
4. Ensure CORS is properly configured
5. Verify client API endpoint is correct

If you need further assistance, please open an issue on the GitHub repository. 