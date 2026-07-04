import { api } from '../lib/api';
import type { DriverProfile, DriverStats, DriverDocument, DriverAvailability } from '../types/api';

export async function fetchMyDriverProfile(): Promise<DriverProfile> {
	const { data } = await api.get('/drivers/me');
	return data as DriverProfile;
}

export async function fetchDriverProfile(id: string): Promise<DriverProfile> {
	const { data } = await api.get(`/drivers/${id}`);
	return data as DriverProfile;
}

export async function fetchDriverStats(id: string): Promise<DriverStats> {
	const { data } = await api.get(`/drivers/${id}/stats`);
	return data as DriverStats;
}

export async function updateAvailability(availability: DriverAvailability): Promise<void> {
	await api.patch('/drivers/me/availability', { availability });
}

export async function updateLocation(
	lat: number,
	lng: number,
	heading?: number,
	speed?: number,
	accuracy?: number,
): Promise<void> {
	await api.patch('/drivers/me/location', { lat, lng, heading, speed, accuracy });
}

export async function fetchDriverDocuments(): Promise<DriverDocument[]> {
	const { data } = await api.get('/drivers/me/documents');
	return data as DriverDocument[];
}

export async function uploadDocument(
	type: string,
	fileUrl: string,
	expiryDate?: string,
): Promise<DriverDocument> {
	const { data } = await api.post('/drivers/me/documents', { type, fileUrl, expiryDate });
	return data as DriverDocument;
}
