import { Grid, Box, styled } from '@mui/material';

//components
import Banner from '../banner/Banner';
import Categories from './Categories';
import Posts from './post/Posts';

const ContentContainer = styled(Box)(({ theme }) => ({
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%',
    padding: theme.spacing(0, 2),
    [theme.breakpoints.up('lg')]: {
        padding: theme.spacing(0, 4)
    }
}));

const SidebarContainer = styled(Grid)(({ theme }) => ({
    padding: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(2, 0)
    }
}));

const PostsContainer = styled(Grid)(({ theme }) => ({
    padding: theme.spacing(0, 0, 4, 0)
}));

const Home = () => {
    return (
        <>
            <Banner />
            <ContentContainer>
                <Grid container spacing={2}>
                    <SidebarContainer item lg={2} md={3} sm={3} xs={12}>
                        <Categories />
                    </SidebarContainer>
                    <PostsContainer container item xs={12} sm={9} md={9} lg={10}>
                        <Posts />
                    </PostsContainer>
                </Grid>
            </ContentContainer>
        </>
    )
}

export default Home;