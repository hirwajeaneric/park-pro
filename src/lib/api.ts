import { SignInFormTypes, SignUpFormTypes } from '@/types';
import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8080",
    // withCredentials: true,
})

export const signIn = (data: SignInFormTypes) => {
    api.post('/login', data);
}

export const signUp = (data: SignUpFormTypes) => {
    api.post('/api/signup', data)
}

export default api;