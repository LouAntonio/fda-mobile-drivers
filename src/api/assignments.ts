import { api } from '../lib/api';
import type { TripAssignment, TripAssignmentStatus } from '../types/api';

export interface TripOffer {
	assignmentId: string;
	tripId: string;
	pickupAddress: string;
	dropoffAddress: string;
	estimatedDistanceKm: number;
	estimatedDurationMin: number;
	totalPrice: number;
	driverId: string;
	driverName: string;
}

export async function acceptAssignment(id: string): Promise<TripAssignment> {
	const { data } = await api.patch(`/trip-assignments/${id}`, { status: 'ACCEPTED' as TripAssignmentStatus });
	return data as TripAssignment;
}

export async function rejectAssignment(id: string): Promise<TripAssignment> {
	const { data } = await api.patch(`/trip-assignments/${id}`, { status: 'REJECTED' as TripAssignmentStatus });
	return data as TripAssignment;
}

export async function fetchMyAssignments(filters?: {
	tripId?: string;
	status?: TripAssignmentStatus;
	page?: number;
	limit?: number;
}): Promise<{ assignments: TripAssignment[]; total: number; page: number; totalPages: number }> {
	const { data } = await api.get('/trip-assignments', { params: filters });
	return data as { assignments: TripAssignment[]; total: number; page: number; totalPages: number };
}
