import { api } from '../lib/api';
import type { AuthTokens } from '../types/api';

type RegisterParams = {
	name: string;
	surname: string;
	phoneNumber: string;
	password: string;
};

export function registerUser(data: RegisterParams) {
	return api.post('/auth/register', data);
}

type LoginParams = { phoneNumber: string; password: string };

export function loginUser(data: LoginParams) {
	return api.post<AuthTokens>('/auth/login', data);
}

type ForgotPasswordParams = { phoneNumber: string };

export function forgotPassword(data: ForgotPasswordParams) {
	return api.post('/auth/forgot-password', data);
}

type ResetPasswordParams = { token: string; password: string };

export function resetPassword(data: ResetPasswordParams) {
	return api.post('/auth/reset-password', data);
}

export function refreshTokens(refreshToken: string) {
	return api.post<AuthTokens>('/auth/refresh', { refreshToken });
}

export function logoutUser(refreshToken: string) {
	return api.post('/auth/logout', { refreshToken });
}

export function loginWithGoogle(accessToken: string) {
	return api.post<AuthTokens>('/auth/google', { accessToken });
}
