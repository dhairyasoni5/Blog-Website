// CommonJS version for compatibility
const fetch = require('node-fetch');

const API_URL = 'http://localhost:8000';

// Test server connection
console.log('Testing connection to server at:', API_URL);

// Try to connect to the server
fetch(API_URL)
  .then(response => {
    console.log('Server connection successful, status:', response.status);
    testSignup();
  })
  .catch(error => {
    console.error('Server connection failed:', error.message);
    process.exit(1);
  });

// Test signup functionality
async function testSignup() {
  const username = 'testuser' + Math.floor(Math.random() * 10000);
  
  const userData = {
    name: 'Test User',
    username: username,
    password: 'TestPassword123!'
  };
  
  console.log('Testing signup with data:', userData);
  
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    console.log('Signup response status:', response.status);
    console.log('Signup response data:', data);
    
    if (response.status === 201) {
      console.log('Signup test successful!');
    } else {
      console.error('Signup test failed!');
    }
  } catch (error) {
    console.error('Error during signup test:', error.message);
  }
} 