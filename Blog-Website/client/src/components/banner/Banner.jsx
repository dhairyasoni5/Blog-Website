import { styled, Box, Typography, Container, useTheme } from '@mui/material';

const BannerContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    height: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
        height: '40vh',
    }
}));

const Overlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url(https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.25,
    zIndex: 1
}));

const ContentContainer = styled(Container)(({ theme }) => ({
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: theme.spacing(2)
}));

const Heading = styled(Typography)(({ theme }) => ({
    fontSize: '4.5rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1.1,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        fontSize: '3rem',
    }
}));

const SubHeading = styled(Typography)(({ theme }) => ({
    fontSize: '1.25rem',
    fontWeight: 400,
    letterSpacing: '0.02em',
    lineHeight: 1.6,
    marginBottom: theme.spacing(4),
    maxWidth: '650px',
    margin: '0 auto',
    opacity: 0.9,
    [theme.breakpoints.down('sm')]: {
        fontSize: '1rem',
        maxWidth: '90%',
    }
}));

const Accent = styled('span')(({ theme }) => ({
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '8px',
        bottom: '5px',
        left: '0',
        backgroundColor: theme.palette.secondary.main,
        zIndex: -1,
        opacity: 0.7,
    }
}));

const Banner = () => {
    const theme = useTheme();
    
    return (
        <BannerContainer>
            <Overlay />
            <ContentContainer maxWidth="md">
                <Heading variant="h1">
                    MINIMAL <Accent>BLOG</Accent>
                </Heading>
                <SubHeading>
                    A clean and minimalist space for your thoughts and ideas. Share your journey with elegance and simplicity.
                </SubHeading>
            </ContentContainer>
        </BannerContainer>
    );
};

export default Banner;