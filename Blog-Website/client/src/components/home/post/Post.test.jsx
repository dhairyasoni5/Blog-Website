import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Post from './Post';

// Sample post data with all necessary properties
const mockPost = {
  _id: '1234567890',
  title: 'Test Post Title',
  description: 'This is a test post description with some content. #testhashtag #blog',
  username: 'testuser',
  categories: 'react,javascript',
  picture: 'https://example.com/image.jpg'
};

// Helper function to render the Post component
const renderPostComponent = (postData = mockPost) => {
  return render(
    <BrowserRouter>
      <Post post={postData} />
    </BrowserRouter>
  );
};

describe('Post Component', () => {
  it('should render post title and description', () => {
    renderPostComponent();
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText(/This is a test post description with some content/i)).toBeInTheDocument();
  });
  
  it('should display author username', () => {
    renderPostComponent();
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });
  
  it('should render categories as chips', () => {
    renderPostComponent();
    
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });
  
  it('should extract and display hashtags from description', () => {
    renderPostComponent();
    
    expect(screen.getByText('#testhashtag')).toBeInTheDocument();
    expect(screen.getByText('#blog')).toBeInTheDocument();
  });
  
  it('should display reading time based on description length', () => {
    renderPostComponent();
    
    // The test post description is short, so reading time should be minimum 1 minute
    expect(screen.getByText(/1 min read/i)).toBeInTheDocument();
  });
  
  it('should handle missing picture by using default image', () => {
    const postWithoutPicture = {
      ...mockPost,
      picture: undefined
    };
    
    renderPostComponent(postWithoutPicture);
    
    // Component should still render without error
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });
  
  it('should handle categories as an array', () => {
    const postWithArrayCategories = {
      ...mockPost,
      categories: ['react', 'typescript']
    };
    
    renderPostComponent(postWithArrayCategories);
    
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });
  
  it('should truncate long titles with ellipsis', () => {
    const postWithLongTitle = {
      ...mockPost,
      title: 'This is a very long post title that should be truncated because it exceeds the character limit set in the component'
    };
    
    renderPostComponent(postWithLongTitle);
    
    // The exact truncated text will depend on the limit set in the component
    expect(screen.getByText(/This is a very long post title.+\.\.\./)).toBeInTheDocument();
  });
  
  it('should truncate long descriptions with ellipsis', () => {
    const veryLongDescription = 'This is a very long description that should be truncated. '.repeat(20);
    const postWithLongDescription = {
      ...mockPost,
      description: veryLongDescription
    };
    
    renderPostComponent(postWithLongDescription);
    
    // The exact truncated text will depend on the limit set in the component
    expect(screen.getByText(/This is a very long description.+\.\.\./)).toBeInTheDocument();
  });
  
  it('should link to post details page', () => {
    renderPostComponent();
    
    const titleLink = screen.getByRole('link');
    expect(titleLink).toHaveAttribute('href', '/details/1234567890');
  });
}); 