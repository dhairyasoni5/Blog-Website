import { 
    Button, 
    List, 
    ListItem, 
    ListItemText, 
    Typography, 
    Box, 
    Divider, 
    Paper, 
    styled 
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';

import { categories } from '../../constants/data';

const CategoriesContainer = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    boxShadow: theme.shadows[1],
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
}));

const CategoryHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}));

const StyledList = styled(List)(({ theme }) => ({
    padding: 0,
    '& .MuiListItem-root': {
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-child': {
            borderBottom: 'none'
        }
    }
}));

const CategoryItem = styled(ListItem)(({ theme, active }) => ({
    padding: theme.spacing(1.5, 2),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: active ? theme.palette.action.selected : 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.action.hover
    }
}));

const CreateButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(3, 2),
    padding: theme.spacing(1, 2),
    fontWeight: 600,
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center'
}));

const Categories = () => {
    const [searchParams] = useSearchParams();
    const currentCategory = searchParams.get('category') || '';
    
    return (
        <CategoriesContainer elevation={1}>
            <CategoryHeader>
                <Typography variant="h6" fontWeight={600}>
                    Categories
                </Typography>
            </CategoryHeader>
            
            <StyledList>
                <CategoryItem 
                    component={Link}
                    to="/"
                    active={!currentCategory ? 1 : 0}
                >
                    <ListItemText 
                        primary="All Categories" 
                        primaryTypographyProps={{ 
                            fontWeight: !currentCategory ? 600 : 400
                        }} 
                    />
                </CategoryItem>
                
                {categories.map(category => (
                    <CategoryItem 
                        key={category.id}
                        component={Link}
                        to={`/?category=${category.type}`}
                        active={currentCategory === category.type ? 1 : 0}
                    >
                        <ListItemText 
                            primary={category.type} 
                            primaryTypographyProps={{ 
                                fontWeight: currentCategory === category.type ? 600 : 400
                            }}
                        />
                    </CategoryItem>
                ))}
            </StyledList>
            
            <Box mt="auto">
                <Divider />
                <CreateButton 
                    variant="contained" 
                    fullWidth
                    component={Link}
                    to={`/create?category=${currentCategory || ''}`}
                    startIcon={<AddIcon />}
                >
                    Create Blog
                </CreateButton>
            </Box>
        </CategoriesContainer>
    )
}

export default Categories;