import {
	useQuery,
	useMutation,
	useQueryClient,
	useInfiniteQuery,
} from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import {
	fetchTrips,
	fetchTripById,
	estimateTrip,
	createTrip,
	cancelTrip,
	fetchTripEvents,
	openDispute,
	updateTripStatus,
	updateDeliveryStatus,
	registerCashCollection,
	type ListTripsFilters,
	type EstimateTripPayload,
	type CreateTripPayload,
} from '../api/trip';
import { tripKeys } from '../lib/queryKeys';
import type { TripStatus, DeliveryStatus } from '../types/api';

export function useTrips(filters: ListTripsFilters = {}) {
	return useInfiniteQuery({
		queryKey: tripKeys.list(filters as Record<string, unknown>),
		queryFn: ({ pageParam }) =>
			fetchTrips({ ...filters, page: pageParam as number }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage.page < lastPage.totalPages) {
				return lastPage.page + 1;
			}
			return undefined;
		},
	});
}

export function useTrip(id: string | undefined) {
	return useQuery({
		queryKey: tripKeys.detail(id!),
		queryFn: () => fetchTripById(id!),
		enabled: !!id,
		refetchInterval: (query) => {
			const trip = query.state.data;
			if (
				trip &&
				(trip.status === 'COMPLETED' || trip.status === 'CANCELLED')
			) {
				return false;
			}
			return 10000;
		},
	});
}

export function useTripEvents(id: string | undefined) {
	return useQuery({
		queryKey: tripKeys.events(id!),
		queryFn: () => fetchTripEvents(id!),
		enabled: !!id,
	});
}

export function useEstimateTrip() {
	return useMutation({
		mutationFn: (payload: EstimateTripPayload) => estimateTrip(payload),
	});
}

export function useRequestTrip() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateTripPayload) => createTrip(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao solicitar viagem',
			);
		},
	});
}

export function useCancelTrip() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, reason }: { id: string; reason: string }) =>
			cancelTrip(id, reason),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: tripKeys.detail(data.id),
			});
			queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao cancelar viagem',
			);
		},
	});
}

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
			queryClient.invalidateQueries({
				queryKey: tripKeys.detail(data.id),
			});
			queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao atualizar status',
			);
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
			queryClient.invalidateQueries({
				queryKey: tripKeys.detail(data.id),
			});
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao atualizar entrega',
			);
		},
	});
}

export function useOpenDispute() {
	return useMutation({
		mutationFn: (payload: {
			tripId: string;
			reason: string;
			description: string;
		}) => openDispute(payload),
		onSuccess: () => {
			Alert.alert('Sucesso', 'Disputa aberta com sucesso');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao abrir disputa',
			);
		},
	});
}

export function useRegisterCashCollection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: {
			tripId: string;
			driverId: string;
			amount?: number;
			notes?: string;
		}) => registerCashCollection(params),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: tripKeys.detail(variables.tripId),
			});
			Alert.alert('Sucesso', 'Recolha de cash registada!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao registar recolha de cash',
			);
		},
	});
}
