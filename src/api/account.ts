import { api } from '../lib/api';

export async function deleteAccount(password?: string): Promise<void> {
	await api.delete('/auth/account', { data: { password } });
}
