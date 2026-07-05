import { api } from '../lib/api';
import type { DriverPayout } from '../types/api';

export interface EarningsSummary {
	availableBalance: number;
	pendingBalance: number;
}

export async function fetchEarningsSummary(): Promise<EarningsSummary> {
	const { data } = await api.get('/drivers/me/earnings');
	return data as EarningsSummary;
}

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
