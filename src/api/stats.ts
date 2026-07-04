import { api } from '../lib/api';

export interface ProfileStats {
	totalTrips: number;
	totalDistanceKm: number;
	totalDurationMin: number;
	totalSpent: number;
}

export interface StatsResponse {
	stats: ProfileStats;
}

export async function fetchProfileStats(): Promise<StatsResponse> {
	const { data } = await api.get('/users/me/stats');
	return data as StatsResponse;
}
