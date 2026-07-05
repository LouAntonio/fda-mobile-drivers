import { api } from '../lib/api';

export async function createTripLocationPoint(data: {
	tripId: string;
	lat: number;
	lng: number;
	speed?: number;
	heading?: number;
}): Promise<void> {
	await api.post('/trip-location-points', data);
}
