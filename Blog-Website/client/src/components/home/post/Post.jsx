import { styled, Box, Typography, Card, CardContent, CardMedia, Chip, Stack } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

const PostCard = styled(Card)(({ theme }) => ({
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.25s ease',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    border: 'none',
    boxShadow: theme.shadows[2],
    maxWidth: '100%',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
    }
}));

const CardImageContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    paddingTop: '56.25%', // 16:9 aspect ratio
    backgroundColor: theme.palette.secondary.light,
    overflow: 'hidden',
    width: '100%'
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)'
    }
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: theme.spacing(3),
    position: 'relative'
}));

const Category = styled(Chip)(({ theme }) => ({
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 500,
    fontSize: '0.75rem',
    '&.hashtag': {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.text.primary,
    }
}));

const CategoriesContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(2)
}));

const TitleLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    '&:hover': {
        textDecoration: 'none'
    }
}));

const Title = styled(Typography)(({ theme }) => ({
    fontSize: '1.35rem',
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    lineHeight: 1.3,
    color: theme.palette.text.primary,
    minHeight: '3.3rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
}));

const Description = styled(Typography)(({ theme }) => ({
    fontSize: '0.95rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
    flexGrow: 1,
    lineHeight: 1.6,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '4.5rem'
}));

const MetaInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(2),
    width: '100%'
}));

const MetaItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.85rem',
    color: theme.palette.text.secondary
}));

const Post = ({ post }) => {
    const url = post.picture ? post.picture : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop';
    
    const addEllipsis = (str, limit) => {
        return str.length > limit ? str.substring(0, limit) + '...' : str;
    }
    
    // Simulate reading time based on description length
    const readingTime = Math.max(1, Math.ceil(post.description.length / 1000));
    
    // Extract hashtags from description if they exist
    const extractHashtags = (text) => {
        const hashtagRegex = /#[a-zA-Z0-9_]+/g;
        return text.match(hashtagRegex) || [];
    };
    
    const hashtags = extractHashtags(post.description);

    // Process categories regardless of whether they're stored as a string or array
    const processCategories = () => {
        if (!post.categories) return [];
        
        // If categories is already an array
        if (Array.isArray(post.categories)) {
            return post.categories;
        }
        
        // If categories is a string
        if (typeof post.categories === 'string') {
            return post.categories.split(',').filter(category => category.trim());
        }
        
        return [];
    };
    
    const categoryList = processCategories();

    return (
        <PostCard>
            <CardImageContainer>
                <StyledCardMedia image={url} title={post.title} />
            </CardImageContainer>
            <StyledCardContent>
                <CategoriesContainer>
                    {categoryList.map((category, index) => (
                        <Category 
                            key={index} 
                            label={typeof category === 'string' ? category.trim() : category} 
                            size="small" 
                        />
                    ))}
                    
                    {hashtags.map((tag, index) => (
                        <Category 
                            key={`tag-${index}`} 
                            label={tag} 
                            size="small"
                            className="hashtag"
                            icon={<LocalOfferOutlinedIcon fontSize="small" />}
                        />
                    ))}
                </CategoriesContainer>
                
                <TitleLink to={`/details/${post._id}`}>
                    <Title variant="h6">{post.title}</Title>
                </TitleLink>
                
                <Description>{post.description.replace(/#[a-zA-Z0-9_]+/g, '').trim()}</Description>
                
                <MetaInfo>
                    <MetaItem>
                        <PersonOutlineIcon fontSize="small" />
                        {post.username}
                    </MetaItem>
                    <MetaItem>
                        <AccessTimeIcon fontSize="small" />
                        {readingTime} min read
                    </MetaItem>
                </MetaInfo>
            </StyledCardContent>
        </PostCard>
    );
};

export default Post;