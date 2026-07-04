import { useEffect, useRef, useCallback } from 'react';
import { updateLocation } from '../api/drivers';

interface UseDriverLocationOptions {
	enabled: boolean;
	intervalMs?: number;
}

export function useDriverLocation({ enabled, intervalMs = 10000 }: UseDriverLocationOptions) {
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

	const sendLocation = useCallback(async (lat: number, lng: number) => {
		try {
			await updateLocation(lat, lng);
			lastLocationRef.current = { lat, lng };
		} catch {
			// Silently fail location updates
		}
	}, []);

	useEffect(() => {
		if (!enabled) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		intervalRef.current = setInterval(async () => {
			try {
				const { AccuracyAuthorization, getCurrentPositionAsync, requestForegroundPermissionsAsync } =
					await import('expo-location');

				const { status } = await requestForegroundPermissionsAsync();
				if (status !== 'granted') return;

				const pos = await getCurrentPositionAsync({
					accuracy: AccuracyAuthorization?.balanced,
				});

				await sendLocation(pos.coords.latitude, pos.coords.longitude);
			} catch {
				// Silently fail
			}
		}, intervalMs);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [enabled, intervalMs, sendLocation]);

	return { sendLocation };
}
