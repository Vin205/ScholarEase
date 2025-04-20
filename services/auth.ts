import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; 

const signup = async (email: string, password: string, name: string, role: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, { email, password, name, role });
    return response.data; // Returns success message
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
};

const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data; // Returns user data
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export { login, signup };