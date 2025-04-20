import { AppBar, Toolbar, styled, Button, Box, IconButton, Typography, useMediaQuery, useTheme, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';

const Component = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
}));

const Container = styled(Toolbar)(({ theme }) => ({
    justifyContent: 'space-between',
    padding: '0 24px',
    minHeight: '64px',
    [theme.breakpoints.up('md')]: {
        justifyContent: 'space-between',
    }
}));

const Logo = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    letterSpacing: '-0.02em',
    fontSize: '1.5rem',
    color: theme.palette.primary.main
}));

const NavItems = styled(Box)(({ theme }) => ({
    display: 'none',
    [theme.breakpoints.up('md')]: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    }
}));

const NavLink = styled(Link)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: 500,
    padding: '8px 16px',
    fontSize: '0.95rem',
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: theme.palette.secondary.main,
    }
}));

const NavButton = styled(Button)(({ theme }) => ({
    marginLeft: '8px',
    fontWeight: 600
}));

const Header = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const logout = () => {
        sessionStorage.removeItem('accessToken');
        navigate('/account');
    };
    
    return (
        <Component position="sticky">
            <Container>
                <Logo variant="h6" component={Link} to="/">
                    MINIMAL BLOG
                </Logo>
                
                {isMobile ? (
                    <>
                        <IconButton 
                            color="inherit" 
                            aria-label="menu"
                            onClick={handleMenuOpen}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleMenuClose} component={Link} to="/">Home</MenuItem>
                            <MenuItem onClick={handleMenuClose} component={Link} to="/about">About</MenuItem>
                            <MenuItem onClick={handleMenuClose} component={Link} to="/contact">Contact</MenuItem>
                            <MenuItem onClick={logout}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <NavItems>
                        <NavLink to="/">HOME</NavLink>
                        <NavLink to="/about">ABOUT</NavLink>
                        <NavLink to="/contact">CONTACT</NavLink>
                        <NavButton 
                            variant="contained" 
                            color="primary"
                            onClick={logout}
                        >
                            LOGOUT
                        </NavButton>
                    </NavItems>
                )}
            </Container>
        </Component>
    );
};

export default Header;