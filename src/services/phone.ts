import { api } from '../lib/api';
import type { ApiResponse } from '../types/api';

export function sendPhoneVerification(phoneNumber: string) {
	return api.post<ApiResponse<never>>('/users/me/verify-phone', {
		phoneNumber,
	});
}

export function confirmPhoneVerification(code: string) {
	return api.patch<ApiResponse<never>>('/users/me/verify-phone', { code });
}
