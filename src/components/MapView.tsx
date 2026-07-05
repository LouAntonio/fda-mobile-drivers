import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, {
	Marker,
	Polyline,
	Region,
	MapPressEvent,
} from 'react-native-maps';

type LatLng = {
	latitude: number;
	longitude: number;
};

type MapViewWrapperProps = {
	initialRegion?: Region;
	style?: object;
	onPress?: (lat: number, lng: number) => void;
	markers?: Array<{
		id: string;
		latitude: number;
		longitude: number;
		title?: string;
	}>;
	routeCoords?: LatLng[];
};

export default function MapViewWrapper({
	initialRegion = {
		latitude: -8.8399,
		longitude: 13.2344,
		latitudeDelta: 0.05,
		longitudeDelta: 0.05,
	},
	style,
	onPress,
	markers = [],
	routeCoords = [],
}: MapViewWrapperProps) {
	const handlePress = (e: MapPressEvent) => {
		if (onPress) {
			onPress(
				e.nativeEvent.coordinate.latitude,
				e.nativeEvent.coordinate.longitude,
			);
		}
	};

	return (
		<View style={[styles.container, style]}>
			<MapView
				style={StyleSheet.absoluteFillObject}
				initialRegion={initialRegion}
				onPress={handlePress}
				mapType="standard"
			>
				{markers.map((m) => (
					<Marker
						key={m.id}
						coordinate={{
							latitude: m.latitude,
							longitude: m.longitude,
						}}
						title={m.title}
						pinColor="#FFD700"
					/>
				))}
				{routeCoords.length > 1 && (
					<Polyline
						coordinates={routeCoords}
						strokeColor="#FFD700"
						strokeWidth={4}
					/>
				)}
			</MapView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		overflow: 'hidden',
		borderRadius: 0,
	},
});
