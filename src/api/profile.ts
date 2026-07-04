import { api } from '../lib/api';
import type { User } from '../store/authStore';

export interface ProfileResponse {
	user: User;
}

export async function fetchProfile(): Promise<ProfileResponse> {
	const { data } = await api.get('/auth/me');
	return { user: data as unknown as User };
}
