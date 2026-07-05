import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import {
	fetchMyVehicles,
	createVehicle,
	updateVehicle,
	deleteVehicle,
	setActiveVehicle,
	type CreateVehiclePayload,
} from '../api/vehicles';

export function useVehicles() {
	return useQuery({
		queryKey: ['vehicles'],
		queryFn: fetchMyVehicles,
	});
}

export function useCreateVehicle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vehicles'] });
			queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
			Alert.alert('Sucesso', 'Veículo cadastrado com sucesso');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao cadastrar veículo',
			);
		},
	});
}

export function useUpdateVehicle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: Partial<CreateVehiclePayload>;
		}) => updateVehicle(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vehicles'] });
			Alert.alert('Sucesso', 'Veículo atualizado');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao atualizar veículo',
			);
		},
	});
}

export function useSetActiveVehicle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (vehicleId: string) => setActiveVehicle(vehicleId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
			Alert.alert('Sucesso', 'Veículo ativo atualizado');
		},
	});
}

export function useDeleteVehicle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteVehicle(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vehicles'] });
		},
	});
}
