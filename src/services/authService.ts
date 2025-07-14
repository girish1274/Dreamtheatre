import api from './api';

interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export const authService = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await api.post('/auth/signin', data);
    return response.data;
  },
};