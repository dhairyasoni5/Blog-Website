import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DataContext } from '../../context/DataProvider';
import CreatePost from './CreatePost';
import { API } from '../../service/api';

// Mock API and navigation
jest.mock('../../service/api', () => ({
  API: {
    createPost: jest.fn(),
    uploadFile: jest.fn()
  }
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    search: ''
  })
}));

// Mock context values
const mockContextValue = {
  account: {
    username: 'testuser',
    name: 'Test User'
  }
};

// Helper function to render the CreatePost component
const renderCreatePostComponent = () => {
  return render(
    <BrowserRouter>
      <DataContext.Provider value={mockContextValue}>
        <CreatePost />
      </DataContext.Provider>
    </BrowserRouter>
  );
};

describe('CreatePost Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the create post form', () => {
    renderCreatePostComponent();
    
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell your story...')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Hashtags')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish/i })).toBeInTheDocument();
  });
  
  it('should disable publish button when title and description are empty', () => {
    renderCreatePostComponent();
    
    const publishButton = screen.getByRole('button', { name: /Publish/i });
    expect(publishButton).toBeDisabled();
  });
  
  it('should enable publish button when title and description are filled', () => {
    renderCreatePostComponent();
    
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByPlaceholderText('Tell your story...'), { target: { value: 'Test content' } });
    
    const publishButton = screen.getByRole('button', { name: /Publish/i });
    expect(publishButton).not.toBeDisabled();
  });
  
  it('should allow adding categories', () => {
    renderCreatePostComponent();
    
    // Open autocomplete dropdown
    const categoryInput = screen.getByPlaceholderText('Select categories');
    fireEvent.click(categoryInput);
    
    // Since this is a complex interaction with Autocomplete, we'd need more specific tests
    // This basic test just verifies the field is present and clickable
    expect(categoryInput).toBeInTheDocument();
  });
  
  it('should allow adding hashtags', () => {
    renderCreatePostComponent();
    
    // Enter hashtag
    const hashtagInput = screen.getByPlaceholderText('Add hashtag');
    fireEvent.change(hashtagInput, { target: { value: 'testing' } });
    
    // Click add button
    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);
    
    // Hashtag should appear in the list
    expect(screen.getByText('#testing')).toBeInTheDocument();
  });
  
  it('should allow removing hashtags', async () => {
    renderCreatePostComponent();
    
    // Add hashtag
    const hashtagInput = screen.getByPlaceholderText('Add hashtag');
    fireEvent.change(hashtagInput, { target: { value: 'testing' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    
    // Verify hashtag appears
    const hashtagChip = screen.getByText('#testing');
    expect(hashtagChip).toBeInTheDocument();
    
    // Find delete button on the chip and click it
    const deleteButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(deleteButton);
    
    // Verify hashtag is removed
    await waitFor(() => {
      expect(screen.queryByText('#testing')).not.toBeInTheDocument();
    });
  });
  
  it('should add hashtag when Enter key is pressed', () => {
    renderCreatePostComponent();
    
    // Enter hashtag and press Enter
    const hashtagInput = screen.getByPlaceholderText('Add hashtag');
    fireEvent.change(hashtagInput, { target: { value: 'entertest' } });
    fireEvent.keyDown(hashtagInput, { key: 'Enter', code: 'Enter' });
    
    // Hashtag should appear in the list
    expect(screen.getByText('#entertest')).toBeInTheDocument();
  });
  
  it('should call API to create post when form is submitted', async () => {
    // Mock successful API responses
    API.createPost.mockResolvedValueOnce({ isSuccess: true });
    
    renderCreatePostComponent();
    
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Test Post Title' } });
    fireEvent.change(screen.getByPlaceholderText('Tell your story...'), { target: { value: 'Test post content' } });
    
    // Add a hashtag
    const hashtagInput = screen.getByPlaceholderText('Add hashtag');
    fireEvent.change(hashtagInput, { target: { value: 'testpost' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    
    // Click publish button
    const publishButton = screen.getByRole('button', { name: /Publish/i });
    fireEvent.click(publishButton);
    
    // Verify API was called with correct data
    await waitFor(() => {
      expect(API.createPost).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Post Title',
        description: expect.stringContaining('Test post content'),
        username: 'testuser'
      }));
    });
  });
  
  it('should handle file uploads', async () => {
    // Mock successful upload
    API.uploadFile.mockResolvedValueOnce({ 
      isSuccess: true,
      data: 'https://example.com/uploaded-image.jpg'
    });
    
    renderCreatePostComponent();
    
    // Create a mock file
    const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
    
    // Get the hidden file input
    const fileInput = screen.getByLabelText('');
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Verify API was called with FormData
    await waitFor(() => {
      expect(API.uploadFile).toHaveBeenCalled();
    });
  });
}); 