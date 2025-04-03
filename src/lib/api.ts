import { ChangePasswordFormTypes, ForgotPasswordFormTypes, SignInFormTypes, SignUpFormTypes, VerifyTokenFormTypes } from '@/types';
import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8080",
})

export const signIn = async (data: SignInFormTypes) => {
    const response = await api.post("/api/login", data);
    return response.data;
}

export const verifyToken = async (data: VerifyTokenFormTypes) => {
    const response = await api.post("/api/verify-account", data);
    return response.data;
}

export const signUp = async (data: SignUpFormTypes) => {
    const response = await api.post("/api/signup", data);
    return response.data;
}

export const requestPasswordReset = async (data: ForgotPasswordFormTypes) => {
    const response = await api.post("/api/password-reset/request", data);
    return response.data;
}

export const changePassword = async (data: ChangePasswordFormTypes) => {
    console.log(data);
    const response = await api.post(`/api/password-reset/confirm?token=${data.token}`, { newPassword: data.newPassword });
    return response.data;
}

export const getProfileData = async (token: string) => {
    // const token = localStorage.getItem("access-token");
    const response = await api.get("/api/users/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export default api;