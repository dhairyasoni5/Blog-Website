import axios from 'axios';

import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from '../constants/config';
import { getAccessToken, getRefreshToken, setAccessToken, getType } from '../utils/common-utils';

// Use environment variable or default to the deployed backend
const API_URL = process.env.REACT_APP_API_URL || 'https://blog-api-veo0.onrender.com';

// Add check for server availability
console.log('API configured with URL:', API_URL);

// Test server connection on startup - wrapped in try/catch to prevent blocking rendering
try {
  fetch(`${API_URL}/api/health`)  // Use a health check endpoint instead of root
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      console.log('Server connection test successful, status:', response.status);
    })
    .catch(error => {
      console.error('Server connection test failed:', error.message);
      // Don't block the app from loading if the server is down
    });
} catch (error) {
  console.error('Connection test threw an exception:', error.message);
}

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "content-type": "application/json"
    },
    withCredentials: true // Enable sending cookies with requests
});

// Add request interceptor for better error handling
axiosInstance.interceptors.request.use(
    function(config) {
        // Skip logging for manifest.json requests
        if (config.url.includes('manifest.json')) {
            return config;
        }
        
        // Log request details for debugging
        console.log('Making request to:', config.url);
        console.log('Request method:', config.method);
        console.log('Request headers:', config.headers);
        
        if (config.TYPE.params) {
            config.params = config.TYPE.params
        } else if (config.TYPE.query) {
            config.url = config.url + '/' + config.TYPE.query;
        }
        return config;
    },
    function(error) {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
    function(response) {
        // Skip logging for manifest.json responses
        if (response.config.url.includes('manifest.json')) {
            return response;
        }
        
        console.log('Response received:', response.status);
        return processResponse(response);
    },
    function(error) {
        // Skip logging for manifest.json errors
        if (error.config?.url?.includes('manifest.json')) {
            return Promise.reject(error);
        }
        
        console.error('Response error:', error);
        return Promise.reject(ProcessError(error));
    }
);

///////////////////////////////
// If success -> returns { isSuccess: true, data: object }
// If fail -> returns { isFailure: true, status: string, msg: string, code: int }
//////////////////////////////
const processResponse = (response) => {
    if (response?.status === 200 || response?.status === 201) {
        return { isSuccess: true, data: response.data }
    } else {
        return {
            isFailure: true,
            status: response?.status,
            msg: response?.data?.msg || 'An unexpected error occurred',
            code: response?.status
        }
    }
}

///////////////////////////////
// If success -> returns { isSuccess: true, data: object }
// If fail -> returns { isError: true, status: string, msg: string, code: int }
//////////////////////////////
const ProcessError = async (error) => {
    console.log('API Error:', error);
    
    if (error.response) {
        // Request made and server responded with a status code 
        // that falls out of the range of 2xx
        console.log("ERROR RESPONSE DATA:", error.response.data);
        console.log("ERROR STATUS:", error.response.status);
        console.log("ERROR HEADERS:", error.response.headers);
        
        // Handle CORS errors specifically
        if (error.response.status === 0) {
            return {
                isError: true,
                msg: 'CORS error: Unable to connect to the server. Please check if the server is running and accessible.',
                code: 0
            };
        }
        
        // Handle 201 successful creation status (not actually an error)
        if (error.response?.status === 201) {
            return {
                isSuccess: true,
                data: error.response.data
            };
        } else if (error.response?.status === 403) {
            // Token expired
            sessionStorage.clear();
            return {
                isError: true,
                msg: error.response.data?.msg || 'Session expired. Please login again.',
                code: error.response.status
            }
        } else {
            console.log("ERROR IN RESPONSE: ", error.toJSON());
            return {
                isError: true,
                msg: error.response.data?.msg || API_NOTIFICATION_MESSAGES.responseFailure.message,
                code: error.response.status
            }
        }
    } else if (error.request) { 
        // The request was made but no response was received
        console.log("ERROR IN REQUEST: ", error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.requestFailure,
            code: ""
        }
    } else { 
        // Something happened in setting up the request that triggered an Error
        console.log("ERROR IN SETUP: ", error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.networkError,
            code: ""
        }
    }
}

const API = {};

for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress) =>
        axiosInstance({
            method: value.method,
            url: value.url,
            data: value.method === 'DELETE' ? '' : body,
            responseType: value.responseType,
            headers: {
                authorization: getAccessToken(),
            },
            TYPE: getType(value, body),
            onUploadProgress: function(progressEvent) {
                if (showUploadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showUploadProgress(percentCompleted);
                }
            },
            onDownloadProgress: function(progressEvent) {
                if (showDownloadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showDownloadProgress(percentCompleted);
                }
            }
        });
}

export { API };