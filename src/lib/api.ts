/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangePasswordFormTypes, ForgotPasswordFormTypes, RequestNewVerificationCodeTypes, SignInFormTypes, SignUpFormTypes, VerifyTokenFormTypes } from '@/types';
import axios from 'axios';

// Define a standard error response type from your backend
interface BackendErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
  error?: string;
}

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Add request interceptor for common headers
api.interceptors.request.use(config => {
  // You can add auth tokens or other headers here if needed
  return config;
}, error => {
  return Promise.reject(error);
});

// Add response interceptor to handle errors consistently
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      const backendError: BackendErrorResponse = error.response.data;
      
      // Format the error message
      let errorMessage = backendError.message || 'An error occurred';
      
      // Handle field-specific errors if they exist
      if (backendError.errors) {
        const fieldErrors = Object.entries(backendError.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        errorMessage = `${errorMessage}. ${fieldErrors}`;
      }
      
      // Create a new error with the formatted message
      const apiError = new Error(errorMessage);
      (apiError as any).status = error.response.status;
      (apiError as any).data = backendError;
      
      return Promise.reject(apiError);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('Network error - no response received from server'));
    } else {
      // Something happened in setting up the request
      return Promise.reject(new Error('Request setup error: ' + error.message));
    }
  }
);

export const signIn = async (data: SignInFormTypes) => {
  try {
    const response = await api.post("/api/login", data);
    return response.data;
  } catch (error) {
    // The interceptor already formatted the error, just rethrow
    throw error;
  }
};

export const verifyToken = async (data: VerifyTokenFormTypes) => {
  try {
    const response = await api.post("/api/verify-account", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNewVerificationCode = async (data: RequestNewVerificationCodeTypes) => {
  try {
    const response = await api.post("/api/new-verification-code", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signUp = async (data: SignUpFormTypes) => {
  try {
    const response = await api.post("/api/signup", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestPasswordReset = async (data: ForgotPasswordFormTypes) => {
  try {
    const response = await api.post("/api/password-reset/request", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (data: ChangePasswordFormTypes) => {
  try {
    const response = await api.post(`/api/password-reset/confirm?token=${data.token}`, { 
      newPassword: data.newPassword 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfileData = async (token: string) => {
  try {
    const response = await api.get("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;