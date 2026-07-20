import { api } from '../lib/api';
import type { DriverPayout, DriverBankAccount } from '../types/api';

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

export async function fetchBankAccounts(): Promise<DriverBankAccount[]> {
	const { data } = await api.get('/drivers/me/bank-accounts');
	return data as DriverBankAccount[];
}

export async function createBankAccount(dto: {
	bankName: string;
	iban: string;
	accountHolder: string;
	isDefault?: boolean;
}): Promise<DriverBankAccount> {
	const { data } = await api.post('/drivers/me/bank-accounts', dto);
	return data as DriverBankAccount;
}

export async function updateBankAccount(
	accountId: string,
	dto: {
		bankName?: string;
		iban?: string;
		accountHolder?: string;
		isDefault?: boolean;
	},
): Promise<DriverBankAccount> {
	const { data } = await api.patch(
		`/drivers/me/bank-accounts/${accountId}`,
		dto,
	);
	return data as DriverBankAccount;
}

export async function deleteBankAccount(
	accountId: string,
): Promise<{ msg: string }> {
	const { data } = await api.delete(
		`/drivers/me/bank-accounts/${accountId}`,
	);
	return data as { msg: string };
}
