import { SignInFormTypes, SignUpFormTypes } from '@/types';
import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8080",
})

export const signIn = async (data: SignInFormTypes) : Promise<string> => {
    const response = await api.post("/login", data);
    return response.data;
}

export const signUp = async (data: SignUpFormTypes) => {
    const response = await api.post("/api/signup", data);
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