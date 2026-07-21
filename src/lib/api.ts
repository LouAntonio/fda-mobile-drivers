import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@env';
import { useAuthStore } from '../store/authStore';
import { navigationRef } from './navigationRef';

export const api = axios.create({
	baseURL: API_URL,
	timeout: 15000,
	headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
	const token = useAuthStore.getState().accessToken;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token!);
		}
	});
	failedQueue = [];
}

function navigateToAuth() {
	if (navigationRef.isReady()) {
		navigationRef.reset({
			index: 0,
			routes: [{ name: 'Auth' }],
		});
	}
}

const AUTH_ENDPOINTS = [
	'/auth/login',
	'/auth/register',
	'/auth/refresh',
	'/auth/logout',
];

api.interceptors.response.use(
	(response) => {
		if (
			response.data &&
			'success' in response.data &&
			'data' in response.data
		) {
			response.data = response.data.data ?? response.data;
		}
		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!AUTH_ENDPOINTS.some((ep) => originalRequest.url?.includes(ep))
		) {
			const { refreshToken } = useAuthStore.getState();
			if (!refreshToken) {
				useAuthStore.getState().logout();
				navigateToAuth();
				return Promise.reject(error);
			}

			if (isRefreshing) {
				return new Promise<string>((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then((token) => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return api(originalRequest);
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const { data } = await api.post('/auth/refresh', { refreshToken });
				const tokens = data as unknown as {
					accessToken: string;
					refreshToken: string;
				};
				useAuthStore
					.getState()
					.setTokens(tokens.accessToken, tokens.refreshToken);
				processQueue(null, tokens.accessToken);
				originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
				return api(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				useAuthStore.getState().logout();
				navigateToAuth();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);
