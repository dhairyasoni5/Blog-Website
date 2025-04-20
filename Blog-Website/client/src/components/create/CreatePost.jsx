import React, { useState, useEffect, useContext } from 'react';

import { 
    styled, 
    Box, 
    TextareaAutosize, 
    Button, 
    InputBase, 
    FormControl,
    TextField,
    Typography,
    Autocomplete,
    Chip,
    Paper,
    Stack,
    Divider
} from '@mui/material';
import { AddCircle as Add, LocalOffer as TagIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

import { API } from '../../service/api';
import { DataContext } from '../../context/DataProvider';
import { categories } from '../../constants/data';

const Container = styled(Box)(({ theme }) => ({
    margin: '50px 100px',
    [theme.breakpoints.down('md')]: {
        margin: '50px 20px'
    }
}));

const Image = styled('img')({
    width: '100%',
    height: '50vh',
    objectFit: 'cover'
});

const StyledFormControl = styled(FormControl)`
    margin-top: 10px;
    display: flex;
    flex-direction: row;
`;

const InputTextField = styled(InputBase)`
    flex: 1;
    margin: 0 30px;
    font-size: 25px;
`;

const Textarea = styled(TextareaAutosize)`
    width: 100%;
    border: none;
    margin-top: 50px;
    font-size: 18px;
    &:focus-visible {
        outline: none;
    }
`;

const FormSection = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    marginTop: theme.spacing(2)
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary
}));

const TagsContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1)
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.text.primary,
    '&.MuiChip-outlined': {
        borderColor: theme.palette.secondary.main,
    }
}));

const PublishButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(3),
    padding: theme.spacing(1, 3),
    fontWeight: 600
}));

const initialPost = {
    title: '',
    description: '',
    picture: '',
    username: '',
    categories: '',
    createdDate: new Date()
}

const CreatePost = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [post, setPost] = useState(initialPost);
    const [file, setFile] = useState('');
    const [hashTags, setHashTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    
    const { account } = useContext(DataContext);

    const url = post.picture ? post.picture : 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80';
    
    useEffect(() => {
        const getImage = async () => { 
            if(file) {
                const data = new FormData();
                data.append("name", file.name);
                data.append("file", file);
                
                const response = await API.uploadFile(data);
                post.picture = response.data;
            }
        }
        getImage();
        
        // Initialize with the category from URL, if any
        const urlCategory = location.search?.split('=')[1] || '';
        if (urlCategory && categories.find(cat => cat.type === urlCategory)) {
            setSelectedCategories([urlCategory]);
        }
        
        post.username = account.username;
    }, [file]);
    
    // Update post categories when selectedCategories changes
    useEffect(() => {
        // Store categories consistently as a string, not as an array
        setPost(prev => ({
            ...prev,
            categories: selectedCategories.join(',')
        }));
    }, [selectedCategories]);

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategories(newValue);
    };
    
    const addHashtag = () => {
        if (tagInput.trim() && !hashTags.includes('#' + tagInput.trim())) {
            const newTag = '#' + tagInput.trim().replace(/\s+/g, '');
            setHashTags([...hashTags, newTag]);
            setTagInput('');
        }
    };
    
    const removeHashtag = (tagToRemove) => {
        setHashTags(hashTags.filter(tag => tag !== tagToRemove));
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            addHashtag();
        }
    };

    const savePost = async () => {
        // Add hashtags to the description
        const hashtagString = hashTags.length > 0 ? '\n\n' + hashTags.join(' ') : '';
        
        // Ensure categories is always a string
        const updatedPost = {
            ...post,
            description: post.description + hashtagString,
            categories: Array.isArray(post.categories) ? post.categories.join(',') : post.categories
        };
        
        await API.createPost(updatedPost);
        navigate('/');
    };

    const handleChange = (e) => {
        setPost({ ...post, [e.target.name]: e.target.value });
    };

    return (
        <Container>
            <StyledPaper elevation={0}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Create New Post
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    Share your thoughts, ideas, and stories with the community
                </Typography>
                
                <Image src={url} alt="post" />

                <StyledFormControl>
                    <label htmlFor="fileInput">
                        <Add fontSize="large" color="action" />
                    </label>
                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: "none" }}
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <InputTextField 
                        onChange={handleChange} 
                        name='title' 
                        placeholder="Title" 
                        required
                    />
                </StyledFormControl>

                <FormSection>
                    <SectionTitle>Categories</SectionTitle>
                    <Autocomplete
                        multiple
                        id="categories-selection"
                        options={categories.map(category => category.type)}
                        value={selectedCategories}
                        onChange={handleCategoryChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                placeholder="Select categories"
                                fullWidth
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                    color="primary"
                                    size="small"
                                />
                            ))
                        }
                    />
                </FormSection>

                <Divider />

                <Textarea
                    minRows={8}
                    placeholder="Tell your story..."
                    name='description'
                    onChange={handleChange}
                />

                <FormSection>
                    <SectionTitle>Hashtags</SectionTitle>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField 
                            variant="outlined"
                            placeholder="Add hashtag"
                            fullWidth
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value.replace(/^#/, ''))}
                            onKeyDown={handleKeyDown}
                            InputProps={{
                                startAdornment: <TagIcon color="action" style={{ marginRight: 8 }} />,
                            }}
                        />
                        <Button 
                            variant="contained" 
                            onClick={addHashtag}
                            disabled={!tagInput.trim()}
                        >
                            Add
                        </Button>
                    </Stack>
                    
                    {hashTags.length > 0 && (
                        <TagsContainer>
                            {hashTags.map((tag, index) => (
                                <StyledChip
                                    key={index}
                                    label={tag}
                                    onDelete={() => removeHashtag(tag)}
                                    variant="outlined"
                                />
                            ))}
                        </TagsContainer>
                    )}
                </FormSection>

                <PublishButton 
                    onClick={savePost} 
                    variant="contained" 
                    color="primary"
                    disabled={!post.title.trim() || !post.description.trim()}
                >
                    Publish
                </PublishButton>
            </StyledPaper>
        </Container>
    );
};

export default CreatePost;