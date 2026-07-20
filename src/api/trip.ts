import { api } from '../lib/api';
import type {
	Coords,
	TripStatus,
	ServiceType,
	PaymentMethod,
	DeliveryStatus,
} from '../types/api';

export interface TripFromApi {
	id: string;
	status: TripStatus;
	serviceType: ServiceType;
	deliveryStatus: string | null;
	pickupAddress: string;
	pickupReference: string | null;
	dropoffAddress: string;
	dropoffReference: string | null;
	pickupCoords?: string;
	dropoffCoords?: string;
	estimatedDistanceKm: number | null;
	estimatedDurationMin: number | null;
	actualDistanceKm: number | null;
	actualDurationMin: number | null;
	surgeMultiplierApplied: number;
	subtotal: number;
	ivaAmount: number;
	serviceFee: number;
	driverEarnings: number;
	totalPrice: number;
	changeFor: number | null;
	discountAmount: number;
	paymentMethod: PaymentMethod;
	paymentStatus: string;
	cancelReason: string | null;
	requestedAt: string;
	acceptedAt: string | null;
	startedAt: string | null;
	completedAt: string | null;
	cancelledAt: string | null;
	createdAt: string;
	updatedAt: string;
	client?: {
		id: string;
		name: string;
		surname: string;
		phoneNumber?: string;
	};
	driver?: {
		id: string;
		biNumber?: string;
		user: {
			id: string;
			name: string;
			surname: string;
			phoneNumber?: string;
			image?: string | null;
		};
		vehicles?: {
			id: string;
			plateNumber: string;
			brand: string;
			model: string;
			type: string;
			color: string;
		}[];
	} | null;
	priceConfig?: {
		id: string;
		vehicleType: string;
		baseFare: number;
		pricePerKm: number;
		pricePerMin: number;
		minFare: number;
		ivaRate: number;
		serviceFeeRate: number;
	} | null;
	coupon?: {
		id: string;
		code: string;
		discountType: string;
		discountValue: number;
	} | null;
	deliveryDetails?: {
		id: string;
		receiverName: string;
		receiverPhone: string;
		packageType: string;
		notes: string | null;
	} | null;
	review?: unknown | null;
	disputes?: unknown[];
	events?: TripEventFromApi[];
}

export interface TripEventFromApi {
	id: string;
	tripId: string;
	type: string;
	actorUserId: string | null;
	createdAt: string;
}

export interface EstimateResult {
	priceConfigId: string;
	pickupZoneId: string | null;
	dropoffZoneId: string | null;
	estimatedDistanceKm: number;
	estimatedDurationMin: number;
	surgeMultiplierApplied: number;
	subtotal: number;
	ivaAmount: number;
	serviceFee: number;
	driverEarnings: number;
	totalPrice: number;
	discountAmount: number;
	couponId: string | null;
	serviceType: ServiceType;
}

export interface ListTripsResponse {
	trips: TripFromApi[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CreateTripPayload {
	serviceType: ServiceType;
	pickupCoords: Coords;
	dropoffCoords: Coords;
	pickupAddress: string;
	pickupReference?: string;
	dropoffAddress: string;
	dropoffReference?: string;
	paymentMethod: PaymentMethod;
	vehicleType: 'MOTO' | 'CARRO';
	idempotencyKey?: string;
	couponCode?: string;
	changeFor?: number;
	deliveryDetails?: {
		receiverName: string;
		receiverPhone: string;
		packageType: string;
		notes?: string;
	};
}

export interface EstimateTripPayload {
	serviceType: ServiceType;
	pickupCoords: Coords;
	dropoffCoords: Coords;
	vehicleType: 'MOTO' | 'CARRO';
}

export interface ListTripsFilters {
	page?: number;
	limit?: number;
	status?: TripStatus;
	serviceType?: ServiceType;
	paymentStatus?: string;
	deliveryStatus?: string;
	dateFrom?: string;
	dateTo?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface DisputePayload {
	tripId: string;
	reason: string;
	description: string;
}

export async function fetchTrips(
	filters: ListTripsFilters = {},
): Promise<ListTripsResponse> {
	const { data } = await api.get('/trips', { params: filters });
	return data as ListTripsResponse;
}

export async function fetchTripById(id: string): Promise<TripFromApi> {
	const { data } = await api.get(`/trips/${id}`);
	return data as TripFromApi;
}

export async function estimateTrip(
	payload: EstimateTripPayload,
): Promise<EstimateResult> {
	const { data } = await api.post('/trips/estimate', payload);
	return data as EstimateResult;
}

export async function createTrip(
	payload: CreateTripPayload,
): Promise<TripFromApi> {
	const { data } = await api.post('/trips', payload);
	return data as TripFromApi;
}

export async function cancelTrip(
	id: string,
	cancelReason: string,
): Promise<TripFromApi> {
	const { data } = await api.post(`/trips/${id}/cancel`, { cancelReason });
	return data as TripFromApi;
}

export async function fetchTripEvents(id: string): Promise<TripEventFromApi[]> {
	const { data } = await api.get(`/trips/${id}/events`);
	return data as TripEventFromApi[];
}

export async function updateTripStatus(
	id: string,
	status: TripStatus,
	cancelReason?: string,
): Promise<TripFromApi> {
	const { data } = await api.patch(`/trips/${id}/status`, {
		status,
		cancelReason,
	});
	return data as TripFromApi;
}

export async function updateDeliveryStatus(
	id: string,
	deliveryStatus: DeliveryStatus,
): Promise<TripFromApi> {
	const { data } = await api.patch(`/trips/${id}/delivery-status`, {
		deliveryStatus,
	});
	return data as TripFromApi;
}

export async function registerCashCollection(params: {
	tripId: string;
	driverId: string;
	amount?: number;
	notes?: string;
}): Promise<void> {
	await api.post('/financial-transactions/cash-collection', params);
}

export async function openDispute(payload: DisputePayload): Promise<void> {
	await api.post('/disputes', payload);
}
