import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import { updateTripStatus, updateDeliveryStatus } from '../api/trip';
import { tripKeys } from '../lib/queryKeys';
import type { TripStatus, DeliveryStatus } from '../types/api';

export function useUpdateTripStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			tripId,
			status,
			cancelReason,
		}: {
			tripId: string;
			status: TripStatus;
			cancelReason?: string;
		}) => updateTripStatus(tripId, status, cancelReason),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: tripKeys.detail(data.id) });
			queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao atualizar status da viagem');
		},
	});
}

export function useUpdateDeliveryStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			tripId,
			deliveryStatus,
		}: {
			tripId: string;
			deliveryStatus: DeliveryStatus;
		}) => updateDeliveryStatus(tripId, deliveryStatus),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: tripKeys.detail(data.id) });
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao atualizar status da entrega');
		},
	});
}
