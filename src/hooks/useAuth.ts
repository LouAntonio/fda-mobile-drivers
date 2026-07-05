import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import {
	loginUser,
	registerUser,
	forgotPassword,
	resetPassword,
	loginWithGoogle,
	logoutUser,
} from '../api/auth';
import { useAuthStore } from '../store/authStore';
import type { AuthTokens } from '../types/api';

export function useLogin() {
	const setAuth = useAuthStore((state) => state.setAuth);

	return useMutation({
		mutationFn: (data: { phoneNumber: string; password: string }) =>
			loginUser(data),
		onSuccess: (res) => {
			const authData = res.data as unknown as AuthTokens;
			if (authData) {
				setAuth(authData.user, authData.accessToken, authData.refreshToken);
			}
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao fazer login.');
		},
	});
}

export function useRegister() {
	return useMutation({
		mutationFn: registerUser,
		onSuccess: () => {
			Alert.alert('Sucesso', 'Conta criada com sucesso!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao criar conta.');
		},
	});
}

export function useForgotPassword() {
	return useMutation({
		mutationFn: forgotPassword,
		onSuccess: () => {
			Alert.alert('Sucesso', 'Email de recuperação enviado!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao enviar email.',
			);
		},
	});
}

export function useResetPassword() {
	return useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			Alert.alert('Sucesso', 'Senha redefinida com sucesso!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao redefinir senha.',
			);
		},
	});
}

export function useGoogleLogin() {
	const setAuth = useAuthStore((state) => state.setAuth);

	return {
		login: async (idToken: string) => {
			try {
				const res = await loginWithGoogle(idToken);
				const authData = res.data as unknown as AuthTokens;
				if (authData) {
					setAuth(authData.user, authData.accessToken, authData.refreshToken);
					return authData;
				}
			} catch (err) {
				const axiosErr = err as AxiosError<{ msg?: string }>;
				Alert.alert(
					'Erro',
					axiosErr.response?.data?.msg ||
						'Erro ao autenticar com Google.',
				);
			}
			return null;
		},
	};
}

export function useLogout() {
	const logoutStore = useAuthStore((state) => state.logout);
	const refreshToken = useAuthStore((state) => state.refreshToken);

	return async () => {
		if (refreshToken) {
			try {
				await logoutUser(refreshToken);
			} catch {
				// Ignore API error on logout
			}
		}
		logoutStore();
	};
}
