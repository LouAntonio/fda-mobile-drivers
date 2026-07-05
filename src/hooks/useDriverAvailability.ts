import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import { updateAvailability } from '../api/drivers';
import type { DriverAvailability } from '../types/api';

export function useDriverAvailability() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (availability: DriverAvailability) =>
			updateAvailability(availability),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao alterar disponibilidade',
			);
		},
	});
}
