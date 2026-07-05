import { api } from '../lib/api';
import type { ApiResponse, UserAddress, AddressLabel } from '../types/api';

export function fetchAddresses(userId: string) {
	return api.get<ApiResponse<UserAddress[]>>(`/users/${userId}/addresses`);
}

type CreateAddressParams = {
	label: AddressLabel;
	customLabel?: string;
	address: string;
	reference?: string;
	lat: number;
	lng: number;
};

export function createAddress(userId: string, data: CreateAddressParams) {
	return api.post<ApiResponse<UserAddress>>(`/users/${userId}/addresses`, data);
}

export function deleteAddress(userId: string, addressId: string) {
	return api.delete<ApiResponse<never>>(`/users/${userId}/addresses/${addressId}`);
}
