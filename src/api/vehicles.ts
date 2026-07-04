import { api } from '../lib/api';
import type { VehicleItem, VehicleType } from '../types/api';

export async function fetchMyVehicles(): Promise<VehicleItem[]> {
	const { data } = await api.get('/vehicles/me');
	return data as VehicleItem[];
}

export async function fetchVehicle(id: string): Promise<VehicleItem> {
	const { data } = await api.get(`/vehicles/${id}`);
	return data as VehicleItem;
}

export interface CreateVehiclePayload {
	plateNumber: string;
	brand: string;
	model: string;
	year?: number;
	color: string;
	type: VehicleType;
	photoUrl?: string;
}

export async function createVehicle(payload: CreateVehiclePayload): Promise<VehicleItem> {
	const { data } = await api.post('/vehicles', payload);
	return data as VehicleItem;
}

export async function updateVehicle(
	id: string,
	payload: Partial<CreateVehiclePayload>,
): Promise<VehicleItem> {
	const { data } = await api.patch(`/vehicles/${id}`, payload);
	return data as VehicleItem;
}

export async function setActiveVehicle(id: string): Promise<void> {
	await api.patch('/drivers/me/active-vehicle', { vehicleId: id });
}

export async function deleteVehicle(id: string): Promise<void> {
	await api.delete(`/vehicles/${id}`);
}
