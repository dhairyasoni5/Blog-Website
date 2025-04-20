import { useState, useEffect } from 'react';
import { Grid, Box, Typography, styled, CircularProgress, Container } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { API } from '../../../service/api';
import Post from './Post';

const PostsContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    },
    width: '100%'
}));

const GridContainer = styled(Grid)(({ theme }) => ({
    display: 'flex',
    width: '100%',
    margin: '0 auto',
    justifyContent: 'flex-start'
}));

const GridItem = styled(Grid)(({ theme }) => ({
    display: 'flex',
    height: '100%',
    '& > *': {
        width: '100%',
        height: '100%'
    }
}));

const EmptyMessage = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    textAlign: 'center',
    padding: theme.spacing(8, 0),
    fontSize: '1.2rem'
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    width: '100%'
}));

const CreateButton = styled(Link)(({ theme }) => ({
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    textDecoration: 'none',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    boxShadow: theme.shadows[3],
    transition: 'all 0.2s ease',
    zIndex: 100,
    '&:hover': {
        transform: 'scale(1.1)',
        boxShadow: theme.shadows[4],
    },
    [theme.breakpoints.down('sm')]: {
        width: '56px',
        height: '56px',
        bottom: '24px',
        right: '24px',
        fontSize: '28px',
    }
}));

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            let response = await API.getAllPosts({ category: category || '' });
            if (response.isSuccess) {
                setPosts(response.data);
            }
            setLoading(false);
        }
        fetchData();
    }, [category]);

    return (
        <PostsContainer>
            {loading ? (
                <LoadingContainer>
                    <CircularProgress />
                </LoadingContainer>
            ) : (
                posts?.length ? (
                    <Container maxWidth="xl" disableGutters>
                        <GridContainer container spacing={3}>
                            {posts.map(post => (
                                <GridItem item xs={12} sm={6} md={4} lg={4} key={post._id}>
                                    <Post post={post} />
                                </GridItem>
                            ))}
                        </GridContainer>
                    </Container>
                ) : (
                    <EmptyMessage>
                        No posts available in this category. Why not create one?
                    </EmptyMessage>
                )
            )}
            <CreateButton to="/create">+</CreateButton>
        </PostsContainer>
    );
};

export default Posts;