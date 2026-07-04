import { api } from '../lib/api';

export interface Promotion {
	id: string;
	code: string;
	description: string | null;
	discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
	discountValue: number;
	maxDiscount: number | null;
	minTripAmount: number | null;
	startsAt: string | null;
	expiresAt: string | null;
	isActive: boolean;
	createdAt: string;
}

export interface PromotionsResponse {
	promotions: Promotion[];
}

export async function fetchActivePromotions(): Promise<PromotionsResponse> {
	const { data } = await api.get('/coupons/active');
	return data as PromotionsResponse;
}
