export type UserRole = 'CLIENT' | 'DRIVER' | 'SUPER_ADMIN' | 'OPERATIONS' | 'SUPPORT' | 'VALIDATOR' | 'FINANCE' | 'FLEET_MANAGER';

export type UserStatus = 'ACTIVE' | 'BANNED' | 'DELETED';

export type VehicleType = 'MOTO' | 'CARRO';

export type ServiceType = 'RIDE' | 'DELIVERY';

export type TripStatus = 'REQUESTED' | 'ACCEPTED' | 'PICKUP_IN_PROGRESS' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'MCX_EXPRESS' | 'UNITEL_MONEY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type AddressLabel = 'HOME' | 'WORK' | 'OTHER';

export type DriverComplianceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type DriverAvailability = 'ONLINE' | 'OFFLINE' | 'BUSY';

export type TripAssignmentStatus = 'OFFERED' | 'REJECTED' | 'EXPIRED';

export type DeliveryStatus = 'WAITING_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';

export type VehicleStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED' | 'MAINTENANCE';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface ApiResponse<T = unknown> {
	success: boolean;
	msg: string;
	data?: T;
}

export interface Coords {
	lat: number;
	lng: number;
}

export interface UserAddress {
	id: string;
	label: AddressLabel;
	customLabel?: string | null;
	address: string;
	reference?: string | null;
	lat: number;
	lng: number;
	createdAt: string;
	updatedAt: string;
}

export interface UserProfile {
	id: string;
	name: string;
	surname: string;
	phoneNumber: string;
	email?: string | null;
	emailVerified: boolean;
	phoneNumberVerified: boolean;
	image?: string | null;
	role: UserRole;
	status: UserStatus;
	hasPassword: boolean;
	accounts?: { providerId: string }[];
	emergencyContactName?: string | null;
	emergencyContactPhone?: string | null;
	deviceId?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	user: UserProfile;
}

export interface DriverProfile {
	id: string;
	userId: string;
	complianceStatus: DriverComplianceStatus;
	availability: DriverAvailability;
	biNumber: string;
	licenseNumber: string;
	ratingAverage: number;
	ratingCount: number;
	completedTripsCount: number;
	cancelledTripsCount: number;
	availableBalance: number;
	pendingBalance: number;
	lastLocationAt: string | null;
	activeVehicleId: string | null;
	fleetId: string | null;
	createdAt: string;
	updatedAt: string;
	user: {
		id: string;
		name: string;
		surname: string;
		email: string | null;
		phoneNumber: string | null;
		image: string | null;
	};
	vehicles: VehicleItem[];
	documents: DriverDocument[];
}

export interface VehicleItem {
	id: string;
	driverId: string;
	plateNumber: string;
	brand: string;
	model: string;
	year: number | null;
	color: string;
	type: VehicleType;
	photoUrl: string | null;
	status: VehicleStatus;
	createdAt: string;
}

export interface DriverDocument {
	id: string;
	driverId: string;
	type: string;
	fileUrl: string;
	status: DocumentStatus;
	rejectionReason: string | null;
	expiryDate: string | null;
	createdAt: string;
}

export interface DriverStats {
	ratingAverage: number;
	ratingCount: number;
	completedTripsCount: number;
	cancelledTripsCount: number;
	availableBalance: number;
	pendingBalance: number;
}

export interface DriverPayout {
	id: string;
	driverId: string;
	amount: number;
	processedAt: string | null;
	reference: string | null;
	createdAt: string;
}

export interface TripAssignment {
	id: string;
	tripId: string;
	driverId: string;
	status: TripAssignmentStatus;
	createdAt: string;
	updatedAt: string;
}

export interface MapboxFeature {
	id: string;
	place_name: string;
	center: [number, number];
	text: string;
	address?: string;
}

export interface MapboxRoute {
	distance: number;
	duration: number;
	geometry: { coordinates: [number, number][] };
}
