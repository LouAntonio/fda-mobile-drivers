import { api } from '../lib/api';
import type { ApiResponse, UserProfile } from '../types/api';

type UpdateProfileParams = {
	name?: string;
	surname?: string;
	phoneNumber?: string;
	image?: string;
};

export function updateProfile(data: UpdateProfileParams) {
	return api.patch<ApiResponse<UserProfile>>('/auth/profile', data);
}

type ChangePasswordParams = {
	currentPassword: string;
	newPassword: string;
};

export function changePassword(data: ChangePasswordParams) {
	return api.post<ApiResponse<never>>('/auth/change-password', data);
}

type ChangeEmailParams = {
	newEmail: string;
	password: string;
};

export function changeEmail(data: ChangeEmailParams) {
	return api.post<ApiResponse<never>>('/auth/change-email', data);
}

type EmergencyContactParams = {
	emergencyContactName: string;
	emergencyContactPhone: string;
};

export function updateEmergencyContact(data: EmergencyContactParams) {
	return api.patch<ApiResponse<UserProfile>>(
		'/users/me/emergency-contact',
		data,
	);
}
