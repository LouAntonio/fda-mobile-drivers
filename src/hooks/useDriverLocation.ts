import { useEffect, useRef, useCallback } from 'react';
import { updateLocation } from '../api/drivers';
import { createTripLocationPoint } from '../api/trip-location';

interface UseDriverLocationOptions {
	enabled: boolean;
	intervalMs?: number;
	tripId?: string;
}

export function useDriverLocation({ enabled, intervalMs = 10000, tripId }: UseDriverLocationOptions) {
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
				const { getCurrentPositionAsync, requestForegroundPermissionsAsync } =
					await import('expo-location');

				const { status } = await requestForegroundPermissionsAsync();
				if (status !== 'granted') return;

				const pos = await getCurrentPositionAsync({});
				const { latitude, longitude, speed, heading } = pos.coords;

				await sendLocation(latitude, longitude);

				if (tripId) {
					await createTripLocationPoint({
						tripId,
						lat: latitude,
						lng: longitude,
						speed: speed ?? undefined,
						heading: heading ?? undefined,
					}).catch(() => {});
				}
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
	}, [enabled, intervalMs, tripId, sendLocation]);

	return { sendLocation };
}
