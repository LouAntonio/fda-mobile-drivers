import axios from 'axios';
import { MAPBOX_ACCESS_TOKEN } from '@env';
import type { MapboxFeature, MapboxRoute } from '../types/api';

const MAPBOX_BASE = 'https://api.mapbox.com';

export async function geocodeForward(query: string): Promise<MapboxFeature[]> {
	if (!query.trim()) return [];

	const url = `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;

	const { data } = await axios.get(url, {
		params: {
			access_token: MAPBOX_ACCESS_TOKEN,
			country: 'ao',
			language: 'pt',
			types: 'address,place,locality,neighborhood,poi',
		},
	});

	return (data.features ?? []).map((f: Record<string, unknown>) => ({
		id: f.id as string,
		place_name: f.place_name as string,
		center: f.center as [number, number],
		text: f.text as string,
		address: f.address as string | undefined,
	}));
}

export async function geocodeReverse(
	lng: number,
	lat: number,
): Promise<MapboxFeature | null> {
	const url = `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${lng},${lat}.json`;

	const { data } = await axios.get(url, {
		params: {
			access_token: MAPBOX_ACCESS_TOKEN,
			country: 'ao',
			language: 'pt',
			types: 'address,place,locality,neighborhood,poi',
		},
	});

	const features = data.features ?? [];
	return features.length > 0
		? {
				id: features[0].id,
				place_name: features[0].place_name,
				center: features[0].center,
				text: features[0].text,
				address: features[0].address,
			}
		: null;
}

export async function getRoute(
	origin: [number, number],
	destination: [number, number],
	profile: 'driving' | 'cycling' | 'walking' = 'driving',
): Promise<MapboxRoute | null> {
	const url = `${MAPBOX_BASE}/directions/v5/mapbox/${profile}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

	const { data } = await axios.get(url, {
		params: {
			access_token: MAPBOX_ACCESS_TOKEN,
			geometries: 'geojson',
			overview: 'full',
			language: 'pt',
		},
	});

	const route = data.routes?.[0];
	if (!route) return null;

	return {
		distance: route.distance,
		duration: route.duration,
		geometry: route.geometry,
	};
}
