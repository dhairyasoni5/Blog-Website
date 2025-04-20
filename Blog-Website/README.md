# Minimal Blog

A modern, responsive full-stack blog application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Complete user authentication system with JWT
- Responsive post grid layout
- Category filtering
- Comment system
- Image upload functionality
- Comprehensive testing suite

## Tech Stack

### Frontend
- React.js
- Material UI
- React Router
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/minimal-blog.git
cd minimal-blog
```

2. Install server dependencies
```
cd server
npm install
```

3. Install client dependencies
```
cd ../client
npm install
```

4. Create .env file in the server directory
```
PORT=8000
DATABASE_URL=your_mongodb_connection_string
ACCESS_SECRET_KEY=your_jwt_access_secret_key
REFRESH_SECRET_KEY=your_jwt_refresh_secret_key
```

5. Run the development server
```
# In the server directory
npm run dev

# In the client directory (in a separate terminal)
npm start
```

## Testing
```
# In the server directory
npm test
```

## Deployment

The application is deployed with:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Material UI](https://mui.com/)
- [Express.js](https://expressjs.com/)
- [JWT](https://jwt.io/) 