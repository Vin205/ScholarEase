import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000'; // Replace with your actual server URL
const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  } catch (error) {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
});

api.interceptors.response.use(
  (response) => {
    console.log('API Success:', response.config.url, response.data);
    return response.data;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      console.error('API Error:', {
        url: error.config.url,
        status: error.response.status,
        data: error.response.data
      });
      
      errorMessage = error.response.data?.error || 
                    error.response.data?.message || 
                    error.response.statusText;
      
      if (error.response.status === 401) {
        AsyncStorage.removeItem('token');
        AsyncStorage.removeItem('userData');
        errorMessage = 'Session expired. Please login again.';
      }
    } else if (error.request) {
      console.error('Network Error:', error.config.url);
      errorMessage = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(errorMessage);
  }
);

const API = {
  // Student Auth
  studentSignup: (data) => api.post('/student/signup', data),
  studentLogin: (data) => api.post('/student/login', data),
  
  // Faculty Auth
  facultySignup: (data) => api.post('/faculty/signup', data),
  facultyLogin: (data) => api.post('/faculty/login', data),
  
  // Applications
  submitApplication: (formData) => api.post('/student/submit', formData),
  getApplications: () => api.get('/student/applications'), // For faculty dashboard
  getStudentApplications: () => api.get('/student/my-applications'), // For student dashboard
  updateApplicationStatus: (studentId, applicationId, data) => 
    api.put(`/student/update/${studentId}/${applicationId}`, data),
  
  // Token Management
  setAuthToken: async (token) => {
    await AsyncStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  clearAuthToken: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
    delete api.defaults.headers.common['Authorization'];
  },
};

export default API;