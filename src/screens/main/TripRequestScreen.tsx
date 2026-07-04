import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Alert,
	ActivityIndicator,
	Platform,
	KeyboardAvoidingView,
	ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import { useEstimateTrip, useRequestTrip } from '../../hooks/useTrips';
import { useMapSearch } from '../../hooks/useMapSearch';
import { useMapRoute } from '../../hooks/useMapRoute';
import MapView from '../../components/MapView';
import type { MainStackParamList } from '../../types/navigation';

export default function TripRequestScreen() {
	const navigation = useNavigation<any>();
	const route = useRoute<RouteProp<MainStackParamList, 'TripRequest'>>();
	const { themeColors, isDark } = useThemeColors();
	const { serviceType, pickupLat, pickupLng, pickupAddress: initialPickup } = route.params;

	const [selectedDropoff, setSelectedDropoff] = useState<{
		latitude: number;
		longitude: number;
		name: string;
	} | null>(null);
	const [couponCode, setCouponCode] = useState('');
	const [pickupReference, setPickupReference] = useState('');
	const [dropoffReference, setDropoffReference] = useState('');

	const keyboardHeight = useKeyboardHeight();
	const { query: dropoffQuery, setQuery: setDropoffQuery, results, isSearching, clearResults } = useMapSearch();
	const { route: mapRoute, fetchRoute } = useMapRoute();
	const estimateMutation = useEstimateTrip();
	const requestMutation = useRequestTrip();

	const userLat = pickupLat ?? -8.8399;
	const userLng = pickupLng ?? 13.2344;
	const userAddress = initialPickup ?? 'Local atual';

	const estimate = estimateMutation.data;

	useEffect(() => {
		if (selectedDropoff) {
			fetchRoute([userLng, userLat], [selectedDropoff.longitude, selectedDropoff.latitude]);
			estimateMutation.mutate({
				serviceType,
				pickupCoords: { lat: userLat, lng: userLng },
				dropoffCoords: { lat: selectedDropoff.latitude, lng: selectedDropoff.longitude },
				vehicleType: 'MOTO',
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedDropoff]);

	const handleSearchResult = (item: { center: [number, number]; place_name: string }) => {
		setSelectedDropoff({
			latitude: item.center[1],
			longitude: item.center[0],
			name: item.place_name,
		});
		setDropoffQuery(item.place_name);
		clearResults();
	};

	const handleRequest = () => {
		if (!selectedDropoff) {
			Alert.alert('Atenção', 'Selecione um destino');
			return;
		}

		requestMutation.mutate(
			{
				serviceType,
				pickupCoords: { lat: userLat, lng: userLng },
				dropoffCoords: { lat: selectedDropoff.latitude, lng: selectedDropoff.longitude },
				pickupAddress: userAddress,
				dropoffAddress: selectedDropoff.name,
				pickupReference: pickupReference || undefined,
				dropoffReference: dropoffReference || undefined,
				paymentMethod: 'CASH',
				vehicleType: 'MOTO',
				couponCode: couponCode || undefined,
			},
			{
				onSuccess: (trip) => {
					navigation.replace('ActiveTrip', { tripId: trip.id });
				},
			},
		);
	};

	const markers = [];
	if (selectedDropoff) {
		markers.push(
			{ id: 'pickup', latitude: userLat, longitude: userLng, title: 'Origem' },
			{ id: 'dropoff', latitude: selectedDropoff.latitude, longitude: selectedDropoff.longitude, title: selectedDropoff.name },
		);
	}

	const routeCoords = mapRoute
		? mapRoute.geometry.coordinates.map(([lng, lat]) => ({
				latitude: lat,
				longitude: lng,
			}))
		: [];

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.background }}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1"
			>
				<View
					className="flex-row items-center px-4 py-3"
					style={{
						backgroundColor: themeColors.background,
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						zIndex: 20,
					}}
				>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						className="w-10 h-10 items-center justify-center rounded-full"
						style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}
					>
						<Ionicons name="chevron-back" size={22} color={themeColors.text} />
					</TouchableOpacity>
					<Text className="flex-1 text-lg font-bold ml-3" style={{ color: themeColors.text }}>
						{serviceType === 'RIDE' ? 'Corrida' : 'Entrega'}
					</Text>
				</View>

				<View className="flex-1">
					<MapView
						style={{ flex: 1 }}
						initialRegion={{
							latitude: selectedDropoff
								? (userLat + selectedDropoff.latitude) / 2
								: userLat,
							longitude: selectedDropoff
								? (userLng + selectedDropoff.longitude) / 2
								: userLng,
							latitudeDelta: 0.05,
							longitudeDelta: 0.05,
						}}
						markers={markers}
						routeCoords={routeCoords}
					/>
				</View>

				<Animated.View
					entering={FadeInUp.duration(400)}
					className="rounded-t-3xl px-5 pt-5 pb-2"
					style={{
						backgroundColor: isDark ? '#1A1A1A' : '#FFF',
						shadowColor: '#000',
						shadowOffset: { width: 0, height: -4 },
						shadowOpacity: 0.1,
						shadowRadius: 16,
						elevation: 12,
						maxHeight: '55%',
					}}
				>
					<ScrollView
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: Math.max(keyboardHeight, 24) }}
					>
						{/* Destination Input */}
						<View
							className="flex-row items-center px-4 py-3 rounded-2xl border mb-3"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
							}}
						>
							<Ionicons name="location-outline" size={20} color={themeColors.primary} />
							<TextInput
								className="flex-1 ml-3 text-base font-semibold"
								style={{ color: themeColors.text }}
								placeholder="Para onde vai?"
								placeholderTextColor="#9CA3AF"
								value={dropoffQuery}
								onChangeText={setDropoffQuery}
							/>
							{isSearching && <ActivityIndicator size="small" />}
						</View>

						{results.length > 0 && (
							<View
								className="mb-3 rounded-2xl overflow-hidden border"
								style={{
									backgroundColor: isDark ? '#2A2A2A' : '#FFF',
									borderColor: isDark ? '#333' : '#E5E7EB',
								}}
							>
								{results.map((item) => (
									<TouchableOpacity
										key={item.id}
										className="flex-row items-center px-4 py-3 border-b"
										style={{ borderColor: isDark ? '#333' : '#F3F4F6' }}
										onPress={() => handleSearchResult(item)}
									>
										<Ionicons name="location" size={16} color={themeColors.primary} />
										<Text
											className="flex-1 ml-3 text-sm font-medium"
											style={{ color: themeColors.text }}
											numberOfLines={2}
										>
											{item.place_name}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						)}

						{/* References */}
						<View className="flex-row gap-2 mb-3">
							<TextInput
								className="flex-1 px-4 py-3 rounded-2xl border text-base"
								style={{
									backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
									borderColor: isDark ? '#333' : '#E5E7EB',
									color: themeColors.text,
								}}
								placeholder="Ref. origem"
								placeholderTextColor="#9CA3AF"
								value={pickupReference}
								onChangeText={setPickupReference}
							/>
							<TextInput
								className="flex-1 px-4 py-3 rounded-2xl border text-base"
								style={{
									backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
									borderColor: isDark ? '#333' : '#E5E7EB',
									color: themeColors.text,
								}}
								placeholder="Ref. destino"
								placeholderTextColor="#9CA3AF"
								value={dropoffReference}
								onChangeText={setDropoffReference}
							/>
						</View>

						{/* Coupon */}
						<TextInput
							className="px-4 py-3 rounded-2xl border text-base mb-3"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
								color: themeColors.text,
							}}
							placeholder="Cupom de desconto (opcional)"
							placeholderTextColor="#9CA3AF"
							value={couponCode}
							onChangeText={setCouponCode}
						/>

						{/* Estimate + Request Button */}
						<View className="flex-row items-center gap-3">
							{estimateMutation.isPending ? (
								<View className="flex-row items-center gap-2">
									<ActivityIndicator size="small" color={themeColors.primary} />
									<Text className="text-sm text-gray-500">Calculando...</Text>
								</View>
							) : estimate ? (
								<View className="flex-row items-center gap-3 flex-1">
									<View className="flex-row items-center gap-2">
										<Text className="text-sm text-gray-500">
											{estimate.estimatedDistanceKm.toFixed(1)} km
										</Text>
										<Text className="text-sm text-gray-500">·</Text>
										<Text className="text-sm text-gray-500">
											{estimate.estimatedDurationMin} min
										</Text>
									</View>
									<Text className="text-lg font-black" style={{ color: themeColors.primary }}>
										{estimate.totalPrice.toLocaleString('pt-AO')} Kz
									</Text>
									{estimate.discountAmount > 0 && (
										<Text className="text-xs text-green-500">
											-{estimate.discountAmount.toLocaleString('pt-AO')} Kz
										</Text>
									)}
								</View>
							) : null}

							<TouchableOpacity
								className="py-3 px-5 rounded-2xl items-center"
								style={{
									backgroundColor: themeColors.primary,
									opacity: selectedDropoff ? 1 : 0.5,
								}}
								onPress={handleRequest}
								disabled={!selectedDropoff || requestMutation.isPending}
							>
								{requestMutation.isPending ? (
									<ActivityIndicator color="#000" />
								) : (
									<Text className="text-base font-black text-secondary">
										Solicitar
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
