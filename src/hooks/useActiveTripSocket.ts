import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { socketManager } from '../lib/socket-manager';
import { useQueryClient } from '@tanstack/react-query';
import { tripKeys } from '../lib/queryKeys';

interface UseActiveTripSocketOptions {
	tripId: string | undefined;
	enabled?: boolean;
}

export function useActiveTripSocket({
	tripId,
	enabled = true,
}: UseActiveTripSocketOptions) {
	const accessToken = useAuthStore((state) => state.accessToken);
	const queryClient = useQueryClient();

	const [clientLocation, setClientLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	const cleanupFns = useRef<(() => void)[]>([]);

	const connect = useCallback(() => {
		if (!accessToken) return;
		socketManager.connect(accessToken);
	}, [accessToken]);

	const disconnect = useCallback(() => {
		socketManager.disconnect();
	}, []);

	useEffect(() => {
		if (!enabled || !tripId || !accessToken) return;

		connect();
		socketManager.joinTrip(tripId);

		const off1 = socketManager.on('trip:status', () => {
			queryClient.invalidateQueries({
				queryKey: tripKeys.detail(tripId),
			});
		});

		const off2 = socketManager.on('trip:driver_assigned', () => {
			queryClient.invalidateQueries({
				queryKey: tripKeys.detail(tripId),
			});
		});

		const off3 = socketManager.on('trip:location', (data: { lat: number; lng: number }) => {
			if (data?.lat && data?.lng) {
				setClientLocation({ lat: data.lat, lng: data.lng });
			}
		});

		const off4 = socketManager.on('trip:delivery_status', () => {
			queryClient.invalidateQueries({
				queryKey: tripKeys.detail(tripId),
			});
		});

		const off5 = socketManager.on('trip:payment_update', () => {
			queryClient.invalidateQueries({
				queryKey: tripKeys.detail(tripId),
			});
		});

		cleanupFns.current = [off1, off2, off3, off4, off5];

		return () => {
			socketManager.leaveTrip(tripId);
			for (const cleanup of cleanupFns.current) {
				cleanup();
			}
			cleanupFns.current = [];
			setClientLocation(null);
		};
	}, [tripId, enabled, accessToken, connect, queryClient]);

	return { connect, disconnect, clientLocation };
}
