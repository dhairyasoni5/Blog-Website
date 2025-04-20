import React, { useState, useEffect } from 'react';

import { 
    Box, 
    styled, 
    TextareaAutosize, 
    Button, 
    FormControl, 
    InputBase,
    TextField,
    Typography,
    Autocomplete,
    Chip,
    Paper,
    Stack,
    Divider
} from '@mui/material';
import { AddCircle as Add, LocalOffer as TagIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import { API } from '../../service/api';
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

const StyledTextArea = styled(TextareaAutosize)`
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

const Update = () => {
    const navigate = useNavigate();

    const [post, setPost] = useState(initialPost);
    const [file, setFile] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [hashTags, setHashTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [originalDescription, setOriginalDescription] = useState('');

    const { id } = useParams();

    const url = post.picture || 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80';
    
    // Extract hashtags from text
    const extractHashtags = (text) => {
        const hashtagRegex = /#[a-zA-Z0-9_]+/g;
        return text.match(hashtagRegex) || [];
    };
    
    // Clean description from hashtags
    const cleanDescriptionFromHashtags = (text) => {
        return text.replace(/#[a-zA-Z0-9_]+/g, '').trim();
    };
    
    useEffect(() => {
        const fetchData = async () => {
            let response = await API.getPostById(id);
            if (response.isSuccess) {
                setPost(response.data);
                
                // Extract categories and set them
                if (response.data.categories) {
                    setSelectedCategories(response.data.categories.split(',').map(cat => cat.trim()).filter(Boolean));
                }
                
                // Extract hashtags from description
                const extractedTags = extractHashtags(response.data.description);
                setHashTags(extractedTags);
                
                // Save original description without hashtags
                const cleanDescription = cleanDescriptionFromHashtags(response.data.description);
                setOriginalDescription(cleanDescription);
                setPost(prev => ({ ...prev, description: cleanDescription }));
            }
        }
        fetchData();
    }, [id]);

    useEffect(() => {
        const getImage = async () => { 
            if(file) {
                const data = new FormData();
                data.append("name", file.name);
                data.append("file", file);
                
                const response = await API.uploadFile(data);
                if (response.isSuccess) {
                    post.picture = response.data;
                    setImageURL(response.data);    
                }
            }
        }
        getImage();
    }, [file]);
    
    // Update post categories when selectedCategories changes
    useEffect(() => {
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

    const updateBlogPost = async () => {
        // Add hashtags to the description
        const hashtagString = hashTags.length > 0 ? '\n\n' + hashTags.join(' ') : '';
        const updatedPost = {
            ...post,
            description: post.description + hashtagString
        };
        
        await API.updatePost(updatedPost);
        navigate(`/details/${id}`);
    };

    const handleChange = (e) => {
        setPost({ ...post, [e.target.name]: e.target.value });
    };

    return (
        <Container>
            <StyledPaper elevation={0}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Update Post
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    Edit your post and make it even better
                </Typography>
                
                <Image src={post.picture || url} alt="post" />

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
                        value={post.title} 
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

                <StyledTextArea
                    minRows={8}
                    placeholder="Tell your story..."
                    name='description'
                    onChange={handleChange} 
                    value={post.description}
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
                    onClick={updateBlogPost} 
                    variant="contained" 
                    color="primary"
                    disabled={!post.title.trim() || !post.description.trim()}
                >
                    Update
                </PublishButton>
            </StyledPaper>
        </Container>
    );
};

export default Update;