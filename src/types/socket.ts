import type { TripStatus, PaymentStatus } from './api';

export interface TripStatusEvent {
	tripId: string;
	status: TripStatus;
	updatedAt: string;
	clientId?: string;
	serviceType?: string;
	cancelReason?: string;
	cancelledBy?: string;
}

export interface TripDriverEvent {
	id: string;
	name: string;
	phoneNumber: string | null;
}

export interface TripVehicleEvent {
	plateNumber: string;
	brand: string;
	model: string;
	color: string;
}

export interface TripDriverAssignedEvent {
	tripId: string;
	driver: TripDriverEvent;
	vehicle?: TripVehicleEvent;
}

export interface TripLocationEvent {
	tripId: string;
	lat: number;
	lng: number;
	speed?: number | null;
	heading?: number | null;
	recordedAt: string;
}

export interface TripDeliveryStatusEvent {
	tripId: string;
	deliveryStatus: string;
	updatedAt: string;
}

export interface TripPaymentUpdateEvent {
	tripId: string;
	paymentStatus: PaymentStatus;
	updatedAt: string;
}

export interface TripOfferEvent {
	assignmentId: string;
	tripId: string;
	pickupAddress: string;
	dropoffAddress: string;
	estimatedDistanceKm: number;
	estimatedDurationMin: number;
	totalPrice: number;
	driverId: string;
	driverName: string;
	offerTimeoutMs?: number;
}

export interface TripOfferAcceptedEvent {
	assignmentId: string;
	tripId: string;
	driver: TripDriverEvent;
	vehicle?: TripVehicleEvent;
}

export interface TripOfferRejectedEvent {
	assignmentId: string;
	tripId: string;
	driverId: string;
	reason?: string;
}

export interface TripOfferExpiredEvent {
	assignmentId: string;
	tripId: string;
}

export interface TripNoDriversEvent {
	tripId: string;
	message: string;
}

export interface SocketEventMap {
	'trip:status': TripStatusEvent;
	'trip:driver_assigned': TripDriverAssignedEvent;
	'trip:location': TripLocationEvent;
	'trip:delivery_status': TripDeliveryStatusEvent;
	'trip:payment_update': TripPaymentUpdateEvent;
	'trip:offer': TripOfferEvent;
	'trip:offer_accepted': TripOfferAcceptedEvent;
	'trip:offer_rejected': TripOfferRejectedEvent;
	'trip:offer_expired': TripOfferExpiredEvent;
	'trip:no_drivers': TripNoDriversEvent;
	error: { message: string };
	connect: void;
	disconnect: string;
	pong: { timestamp: string };
	'rejoin:rooms:ack': { rooms: string[]; timestamp: string };
}
