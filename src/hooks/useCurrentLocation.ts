import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { geocodeReverse } from '../services/map';

type CurrentLocation = {
	latitude: number;
	longitude: number;
	address: string;
};

export function useCurrentLocation() {
	const [location, setLocation] = useState<CurrentLocation | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const { status } =
					await Location.requestForegroundPermissionsAsync();
				if (status !== 'granted') {
					if (!cancelled) {
						setError('Permissão de localização negada');
						setLoading(false);
					}
					return;
				}

				const pos = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});

				const { latitude, longitude } = pos.coords;

				let address = 'Local atual';
				try {
					const feature = await geocodeReverse(longitude, latitude);
					if (feature) {
						address = feature.place_name;
					}
				} catch {}

				if (!cancelled) {
					setLocation({ latitude, longitude, address });
					setLoading(false);
				}
			} catch (err) {
				if (!cancelled) {
					setError('Erro ao obter localização');
					setLoading(false);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	return { location, error, loading };
}
