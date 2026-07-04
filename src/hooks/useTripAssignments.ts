import { useEffect, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import { acceptAssignment, rejectAssignment, type TripOffer } from '../api/assignments';
import { useAuthStore } from '../store/authStore';
import { socketManager } from '../lib/socket-manager';

export function useTripOfferListener() {
	const accessToken = useAuthStore((state) => state.accessToken);
	const [currentOffer, setCurrentOffer] = useState<TripOffer | null>(null);

	useEffect(() => {
		if (!accessToken) return;

		socketManager.connect(accessToken);

		const unsubscribe = socketManager.on('trip:offer', (data) => {
			setCurrentOffer(data as unknown as TripOffer);
		});

		return () => {
			unsubscribe();
			setCurrentOffer(null);
		};
	}, [accessToken]);

	const dismissOffer = useCallback(() => {
		setCurrentOffer(null);
	}, []);

	return { currentOffer, setCurrentOffer, dismissOffer };
}

export function useAcceptAssignment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (assignmentId: string) => acceptAssignment(assignmentId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trips'] });
			queryClient.invalidateQueries({ queryKey: ['driver'] });
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao aceitar viagem');
		},
	});
}

export function useRejectAssignment() {
	return useMutation({
		mutationFn: (assignmentId: string) => rejectAssignment(assignmentId),
	});
}
