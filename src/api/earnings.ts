import { api } from '../lib/api';
import type { DriverPayout } from '../types/api';

export async function fetchPayouts(filters?: {
	page?: number;
	limit?: number;
}): Promise<{
	payouts: DriverPayout[];
	total: number;
	page: number;
	totalPages: number;
}> {
	const { data } = await api.get('/drivers/me/payouts', { params: filters });
	return data as {
		payouts: DriverPayout[];
		total: number;
		page: number;
		totalPages: number;
	};
}

export async function requestPayout(amount: number): Promise<DriverPayout> {
	const { data } = await api.post('/drivers/me/payouts', { amount });
	return data as DriverPayout;
}
