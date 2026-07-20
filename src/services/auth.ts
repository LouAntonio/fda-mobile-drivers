import { api } from '../lib/api';
import type { User } from '../store/authStore';

type ApiResponse<T> = {
	success: boolean;
	msg: string;
	data?: T;
};

type RegisterParams = {
	name: string;
	surname: string;
	phoneNumber: string;
	password: string;
};

export function registerUser(data: RegisterParams) {
	return api.post<ApiResponse<never>>('/auth/register', data);
}

type LoginParams = {
	phoneNumber: string;
	password: string;
};

type LoginData = {
	accessToken: string;
	refreshToken: string;
	user: User;
};

export function loginUser(data: LoginParams) {
	return api.post<ApiResponse<LoginData>>('/auth/login', data);
}

type ForgotPasswordParams = {
	phoneNumber: string;
};

export function forgotPassword(data: ForgotPasswordParams) {
	return api.post<ApiResponse<never>>('/auth/forgot-password', data);
}

type ResetPasswordParams = {
	token: string;
	password: string;
};

export function resetPassword(data: ResetPasswordParams) {
	return api.post<ApiResponse<never>>('/auth/reset-password', data);
}

type RefreshData = {
	accessToken: string;
	refreshToken: string;
	user: { id: string; email: string | null; name: string };
};

export function refreshTokens(refreshToken: string) {
	return api.post<ApiResponse<RefreshData>>('/auth/refresh', {
		refreshToken,
	});
}

export function logoutUser(refreshToken: string) {
	return api.post<ApiResponse<never>>('/auth/logout', { refreshToken });
}

export function loginWithGoogle(accessToken: string) {
	return api.post<ApiResponse<LoginData>>('/auth/google', { accessToken });
}

type MeData = User;

export function fetchMe() {
	return api.get<ApiResponse<MeData>>('/auth/me');
}
