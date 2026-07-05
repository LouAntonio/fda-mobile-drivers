import { api } from '../lib/api';

export interface ContactPayload {
	name: string;
	email?: string;
	phone?: string;
	message: string;
}

export async function sendContactMessage(
	payload: ContactPayload,
): Promise<void> {
	await api.post('/support/contact', payload);
}
