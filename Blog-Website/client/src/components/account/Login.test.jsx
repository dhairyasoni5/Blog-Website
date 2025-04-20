import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DataContext } from '../../context/DataProvider';
import Login from './Login';
import { API } from '../../service/api';

// Mock API and navigation
jest.mock('../../service/api', () => ({
  API: {
    userLogin: jest.fn(),
    userSignup: jest.fn()
  }
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock context values
const mockSetAccount = jest.fn();
const mockContextValue = {
  setAccount: mockSetAccount
};

// Mock session storage
const mockSessionStorage = {};
global.sessionStorage = {
  setItem: (key, value) => {
    mockSessionStorage[key] = value;
  },
  getItem: (key) => mockSessionStorage[key],
  clear: () => {
    Object.keys(mockSessionStorage).forEach(key => {
      delete mockSessionStorage[key];
    });
  }
};

const renderLoginComponent = (isUserAuthenticated = jest.fn()) => {
  return render(
    <BrowserRouter>
      <DataContext.Provider value={mockContextValue}>
        <Login isUserAuthenticated={isUserAuthenticated} />
      </DataContext.Provider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
  });

  it('should render login form initially', () => {
    renderLoginComponent();
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should switch to signup form when link is clicked', () => {
    renderLoginComponent();
    
    fireEvent.click(screen.getByText(/Don't have an account?/i));
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('should validate login form before submission', async () => {
    renderLoginComponent();
    
    // Try to login without input
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('should validate signup form before submission', async () => {
    renderLoginComponent();
    
    // Switch to signup
    fireEvent.click(screen.getByText(/Don't have an account?/i));
    
    // Try to sign up without input
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('should call API for login with valid credentials', async () => {
    const mockIsUserAuthenticated = jest.fn();
    renderLoginComponent(mockIsUserAuthenticated);
    
    // Mock successful API response
    API.userLogin.mockResolvedValueOnce({
      isSuccess: true,
      data: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        name: 'Test User',
        username: 'testuser'
      }
    });
    
    // Fill login form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(API.userLogin).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
      expect(mockSetAccount).toHaveBeenCalledWith({ name: 'Test User', username: 'testuser' });
      expect(mockIsUserAuthenticated).toHaveBeenCalledWith(true);
      expect(mockSessionStorage.accessToken).toBe('Bearer test-access-token');
      expect(mockSessionStorage.refreshToken).toBe('Bearer test-refresh-token');
    });
  });

  it('should call API for signup with valid data', async () => {
    renderLoginComponent();
    
    // Mock successful API response
    API.userSignup.mockResolvedValueOnce({
      isSuccess: true
    });
    
    // Switch to signup
    fireEvent.click(screen.getByText(/Don't have an account?/i));
    
    // Fill signup form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Password123!' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    await waitFor(() => {
      expect(API.userSignup).toHaveBeenCalledWith({ 
        name: 'New User', 
        username: 'newuser', 
        password: 'Password123!' 
      });
    });
  });

  it('should show error for password mismatch in signup', async () => {
    renderLoginComponent();
    
    // Switch to signup
    fireEvent.click(screen.getByText(/Don't have an account?/i));
    
    // Fill signup form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'DifferentPassword' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(API.userSignup).not.toHaveBeenCalled();
  });

  it('should show error message when login fails', async () => {
    renderLoginComponent();
    
    // Mock failed API response
    API.userLogin.mockResolvedValueOnce({
      isSuccess: false,
      msg: 'Invalid username or password'
    });
    
    // Fill login form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check error message is shown
    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument();
  });
}); 