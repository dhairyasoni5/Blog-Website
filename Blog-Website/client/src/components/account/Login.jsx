import React, { useState, useEffect, useContext } from 'react';
import { 
  TextField, 
  Box, 
  Button, 
  Typography, 
  styled, 
  Paper, 
  Container,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

import { API } from '../../service/api';
import { DataContext } from '../../context/DataProvider';

const AuthContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(3)
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 450,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  overflow: 'hidden'
}));

const AuthHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  textAlign: 'center'
}));

const Logo = styled('img')(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.common.white
}));

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 3)
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.2, 0),
  fontWeight: 600
}));

const ToggleText = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(2),
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'underline'
  }
}));

const PasswordStrengthBar = styled(LinearProgress)(({ theme, value }) => ({
  marginTop: theme.spacing(1),
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.palette.secondary.light,
  '& .MuiLinearProgress-bar': {
    backgroundColor: 
      value < 30 ? theme.palette.error.main :
      value < 60 ? theme.palette.warning.main :
      theme.palette.success.main
  }
}));

// Password strength requirements
const MINIMUM_PASSWORD_LENGTH = 8;
const HAS_NUMBER = /\d/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_SPECIAL_CHAR = /[!@#$%^&*(),.?":{}|<>]/;

// Initial form values
const loginInitialValues = {
  username: '',
  password: ''
};

const signupInitialValues = {
  name: '',
  username: '',
  password: '',
  confirmPassword: ''
};

const Login = ({ isUserAuthenticated }) => {
  const [login, setLogin] = useState(loginInitialValues);
  const [signup, setSignup] = useState(signupInitialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });
  const [account, toggleAccount] = useState('login');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
  const { setAccount } = useContext(DataContext);

  const imageURL = 'https://i.imgur.com/6b1NtiM.png'; // Modern minimal blog logo

  useEffect(() => {
    setError({ show: false, message: '' });
  }, [login, signup]);

  // Calculate password strength when password changes
  useEffect(() => {
    if (signup.password) {
      let strength = 0;
      
      if (signup.password.length >= MINIMUM_PASSWORD_LENGTH) strength += 25;
      if (HAS_NUMBER.test(signup.password)) strength += 25;
      if (HAS_UPPERCASE.test(signup.password) && HAS_LOWERCASE.test(signup.password)) strength += 25;
      if (HAS_SPECIAL_CHAR.test(signup.password)) strength += 25;
      
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [signup.password]);

  const onLoginChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const onSignupChange = (e) => {
    setSignup({ ...signup, [e.target.name]: e.target.value });
    
    // Clear specific error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateLoginForm = () => {
    let isValid = true;
    const errors = {};

    if (!login.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!login.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const validateSignupForm = () => {
    let isValid = true;
    const errors = {};

    if (!signup.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!signup.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!signup.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (signup.password.length < MINIMUM_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters`;
      isValid = false;
    } else if (passwordStrength < 50) {
      errors.password = 'Password is too weak';
      isValid = false;
    }

    if (signup.password !== signup.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const loginUser = async () => {
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    try {
      let response = await API.userLogin(login);
      if (response.isSuccess) {
        sessionStorage.setItem('accessToken', `Bearer ${response.data.accessToken}`);
        sessionStorage.setItem('refreshToken', `Bearer ${response.data.refreshToken}`);
        setAccount({ name: response.data.name, username: response.data.username });
        
        isUserAuthenticated(true);
        setLogin(loginInitialValues);
        navigate('/');
      } else {
        setError({ 
          show: true, 
          message: response.msg || 'Invalid username or password. Please try again.' 
        });
      }
    } catch (err) {
      setError({ 
        show: true, 
        message: 'An error occurred. Please try again later.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signupUser = async () => {
    if (!validateSignupForm()) return;
    
    setIsLoading(true);
    try {
      const { confirmPassword, ...signupData } = signup;
      console.log('Sending signup data:', signupData);
      
      let response = await API.userSignup(signupData);
      console.log('Signup response:', response);
      
      // Check all possible success scenarios
      if (response.isSuccess || 
          (response.data && response.data.msg && response.data.msg.includes('success'))) {
        setSignup(signupInitialValues);
        toggleAccount('login');
        setError({ 
          show: true,
          message: 'Account created successfully! Please login.' 
        });
      } else if (response.isError) {
        // Handle errors from API error structure
        setError({ 
          show: true, 
          message: response.msg || 'Registration failed. Please try again.' 
        });
      } else {
        // Handle errors from API success structure with error status
        const errorMessage = response.data?.msg || response.data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
        setError({ 
          show: true, 
          message: errorMessage
        });
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setError({ 
        show: true, 
        message: 'An error occurred. Please try again later.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignup = () => {
    setFormErrors({});
    setError({ show: false, message: '' });
    toggleAccount(account === 'signup' ? 'login' : 'signup');
  };

  const handleCloseSnackbar = () => {
    setError({ ...error, show: false });
  };

  return (
    <AuthContainer maxWidth="lg">
      <AuthPaper elevation={3}>
        <AuthHeader>
          <Logo src={imageURL} alt="Minimal Blog" />
          <Typography variant="h4" component="h1" fontWeight={700}>
            {account === 'login' ? 'Welcome Back' : 'Create Account'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            {account === 'login' 
              ? 'Sign in to continue to Minimal Blog' 
              : 'Join our minimal blogging community'}
          </Typography>
        </AuthHeader>

        <FormContainer>
          {account === 'login' ? (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Username"
                name="username"
                value={login.username}
                onChange={onLoginChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={login.password}
                onChange={onLoginChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <StyledButton
                fullWidth
                variant="contained"
                color="primary"
                onClick={loginUser}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </StyledButton>

              <Box mt={3}>
                <Grid container justifyContent="center" alignItems="center" spacing={2}>
                  <Grid item xs={5}>
                    <Divider />
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2" align="center" color="textSecondary">
                      OR
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Divider />
                  </Grid>
                </Grid>
              </Box>

              <ToggleText variant="body2" onClick={toggleSignup}>
                Don't have an account? Sign up here
              </ToggleText>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Full Name"
                name="name"
                value={signup.name}
                onChange={onSignupChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Username"
                name="username"
                value={signup.username}
                onChange={onSignupChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={signup.password}
                onChange={onSignupChange}
                error={!!formErrors.password}
                helperText={formErrors.password || (
                  signup.password && 
                  `Password strength: ${
                    passwordStrength < 30 ? 'Weak' : 
                    passwordStrength < 60 ? 'Medium' : 
                    'Strong'
                  }`
                )}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {signup.password && (
                <PasswordStrengthBar 
                  variant="determinate" 
                  value={passwordStrength} 
                />
              )}
              
              {signup.password && (
                <Box mt={1}>
                  <Typography variant="caption" color="textSecondary">
                    Password must contain:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography 
                        variant="caption" 
                        color={signup.password.length >= MINIMUM_PASSWORD_LENGTH ? "success.main" : "text.secondary"}
                      >
                        • At least {MINIMUM_PASSWORD_LENGTH} characters
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography 
                        variant="caption" 
                        color={HAS_NUMBER.test(signup.password) ? "success.main" : "text.secondary"}
                      >
                        • At least one number
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography 
                        variant="caption" 
                        color={(HAS_UPPERCASE.test(signup.password) && HAS_LOWERCASE.test(signup.password)) ? "success.main" : "text.secondary"}
                      >
                        • Upper & lowercase letters
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography 
                        variant="caption" 
                        color={HAS_SPECIAL_CHAR.test(signup.password) ? "success.main" : "text.secondary"}
                      >
                        • At least one special character
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              <TextField
                fullWidth
                margin="normal"
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={signup.confirmPassword}
                onChange={onSignupChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <StyledButton
                fullWidth
                variant="contained"
                color="primary"
                onClick={signupUser}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </StyledButton>

              <Box mt={3}>
                <Grid container justifyContent="center" alignItems="center" spacing={2}>
                  <Grid item xs={5}>
                    <Divider />
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2" align="center" color="textSecondary">
                      OR
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Divider />
                  </Grid>
                </Grid>
              </Box>

              <ToggleText variant="body2" onClick={toggleSignup}>
                Already have an account? Sign in here
              </ToggleText>
            </>
          )}
        </FormContainer>
      </AuthPaper>
      
      <Snackbar
        open={error.show}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error.message.includes('success') ? 'success' : 'error'}
          variant="filled"
        >
          {error.message}
        </Alert>
      </Snackbar>
    </AuthContainer>
  );
};

export default Login;