import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import {
	fetchAddresses,
	createAddress,
	updateAddress,
	deleteAddress,
} from '../api/address';
import { useAuthStore } from '../store/authStore';
import type { AddressLabel, UserAddress, ApiResponse } from '../types/api';

export function useAddresses() {
	const user = useAuthStore((state) => state.user);
	const userId = user?.id;
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['addresses', userId],
		queryFn: async () => {
			const res = await fetchAddresses(userId!);
			const body = res.data as unknown as ApiResponse<UserAddress[]>;
			return body.data ?? [];
		},
		enabled: !!userId,
	});

	const createMutation = useMutation({
		mutationFn: async (data: {
			label: AddressLabel;
			customLabel?: string;
			address: string;
			reference?: string;
			lat: number;
			lng: number;
		}) => {
			await createAddress(userId!, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
			Alert.alert('Sucesso', 'Endereço adicionado!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao adicionar endereço.',
			);
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			addressId,
			data,
		}: {
			addressId: string;
			data: {
				label?: AddressLabel;
				customLabel?: string;
				address?: string;
				reference?: string;
				lat?: number;
				lng?: number;
			};
		}) => {
			await updateAddress(userId!, addressId, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
			Alert.alert('Sucesso', 'Endereço atualizado!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao atualizar endereço.',
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (addressId: string) => {
			await deleteAddress(userId!, addressId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao remover endereço.',
			);
		},
	});

	return {
		addresses: query.data ?? ([] as UserAddress[]),
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
		createAddress: createMutation.mutate,
		isCreating: createMutation.isPending,
		updateAddress: updateMutation.mutate,
		isUpdating: updateMutation.isPending,
		deleteAddress: deleteMutation.mutate,
		isDeleting: deleteMutation.isPending,
	};
}
