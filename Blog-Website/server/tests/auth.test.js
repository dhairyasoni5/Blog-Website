import request from 'supertest';
import { expect } from 'chai';
import bcrypt from 'bcrypt';
import app from '../index.js';
import User from '../model/user.js';
import { connectDB, disconnectDB, clearDB } from './helpers/db.js';

// Test user data
const testUser = {
  name: 'Test User',
  username: 'testuser' + Math.floor(Math.random() * 10000),
  password: 'TestPassword123!'
};

let accessToken, refreshToken;

describe('Authentication API', () => {
  before(async () => {
    // Connect to test database using the shared helper
    await connectDB();
    
    // Clear users collection
    await User.deleteMany({});
  });

  after(async () => {
    // No mongoose.connection.close() here
  });

  describe('POST /signup', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/signup')
        .send(testUser);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('msg', 'Signup successful. You can now login with your credentials.');
      
      // Verify user was saved to database
      const user = await User.findOne({ username: testUser.username });
      expect(user).to.not.be.null;
      expect(user.name).to.equal(testUser.name);
      
      // Verify password was hashed
      const passwordMatch = await bcrypt.compare(testUser.password, user.password);
      expect(passwordMatch).to.be.true;
    });

    it('should return 409 if username already exists', async () => {
      const res = await request(app)
        .post('/signup')
        .send(testUser);

      expect(res.status).to.equal(409);
      expect(res.body).to.have.property('msg', 'Username already exists. Please choose another one.');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ username: 'incomplete' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('msg', 'Validation failed');
    });
  });

  describe('POST /login', () => {
    it('should login with valid credentials and return tokens', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('accessToken');
      expect(res.body).to.have.property('refreshToken');
      expect(res.body).to.have.property('name', testUser.name);
      expect(res.body).to.have.property('username', testUser.username);
      
      // Save tokens for later tests
      accessToken = `Bearer ${res.body.accessToken}`;
      refreshToken = `Bearer ${res.body.refreshToken}`;
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: testUser.username,
          password: 'wrong-password'
        });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('msg', 'Invalid username or password');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          username: 'nonexistent-user',
          password: 'any-password'
        });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('msg', 'Invalid username or password');
    });
  });

  describe('POST /token', () => {
    it('should generate a new access token with valid refresh token', async () => {
      // Extract the raw token without 'Bearer ' prefix
      const rawToken = refreshToken.replace('Bearer ', '');
      
      const res = await request(app)
        .post('/token')
        .send({ token: rawToken });
        
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('accessToken');
    });

    it('should return 401 for missing refresh token', function(done) {
      request(app)
        .post('/token')
        .send({})
        .end((err, res) => {
          try {
            expect(res.status).to.equal(401);
            done();
          } catch(err) {
            done(err);
          }
        });
    });
  });

  describe('POST /logout', () => {
    it('should successfully logout with valid refresh token', async () => {
      const res = await request(app)
        .post('/logout')
        .send({ token: refreshToken.replace('Bearer ', '') });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('msg', 'Logout successful');
      
      // Verify refresh token is removed
      const tokenRes = await request(app)
        .post('/token')
        .send({ token: refreshToken });
        
      expect(tokenRes.status).to.equal(404);
    });

    it('should return 400 for missing token', async () => {
      const res = await request(app)
        .post('/logout')
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('msg', 'Refresh token is required');
    });
  });
}); 