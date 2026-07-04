import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Keyboard,
	Alert,
	ActivityIndicator,
	Linking,
	Modal,
	Platform,
	KeyboardAvoidingView,
	Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useTrip, useCancelTrip } from '../../hooks/useTrips';
import { useActiveTripSocket } from '../../hooks/useActiveTripSocket';
import { useMapRoute } from '../../hooks/useMapRoute';
import MapView from '../../components/MapView';
import type { MainStackParamList } from '../../types/navigation';

function parseWktPoint(wkt: string): { lat: number; lng: number } | null {
	const match = wkt.match(/POINT\s*\(\s*([\d.-]+)\s+([\d.-]+)\s*\)/i);
	if (!match) return null;
	return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
}

const STATUS_LABELS: Record<string, { label: string; icon: string; color: string }> = {
	REQUESTED: { label: 'Procurando motorista...', icon: 'search', color: '#F59E0B' },
	ACCEPTED: { label: 'Motorista a caminho', icon: 'person', color: '#3B82F6' },
	PICKUP_IN_PROGRESS: { label: 'Motorista chegou', icon: 'location', color: '#3B82F6' },
	STARTED: { label: 'Em andamento', icon: 'navigate', color: '#3B82F6' },
	COMPLETED: { label: 'Viagem concluída', icon: 'checkmark-circle', color: '#10B981' },
	CANCELLED: { label: 'Viagem cancelada', icon: 'close-circle', color: '#ED1C24' },
};

export default function ActiveTripScreen() {
	const navigation = useNavigation<any>();
	const route = useRoute<RouteProp<MainStackParamList, 'ActiveTrip'>>();
	const { themeColors, isDark } = useThemeColors();
	const { tripId } = route.params;

	const [showCancelInput, setShowCancelInput] = useState(false);
	const [cancelReason, setCancelReason] = useState('');

	const { data: trip, isLoading } = useTrip(tripId);
	const cancelMutation = useCancelTrip();
	const { clientLocation: driverLocation } = useActiveTripSocket({ tripId, enabled: true });
	const { location: currentLocation } = useCurrentLocation();
	const { route: mapRoute, fetchRoute } = useMapRoute();

	useEffect(() => {
		if (!trip?.pickupCoords || !trip?.dropoffCoords) return;
		const pickup = parseWktPoint(trip.pickupCoords);
		const dropoff = parseWktPoint(trip.dropoffCoords);
		if (pickup && dropoff) {
			fetchRoute(
				[pickup.lng, pickup.lat],
				[dropoff.lng, dropoff.lat],
			);
		}
	}, [trip?.pickupCoords, trip?.dropoffCoords]);

	const statusInfo = trip
		? STATUS_LABELS[trip.status] ?? STATUS_LABELS.REQUESTED
		: STATUS_LABELS.REQUESTED;
	const driver = trip?.driver;
	const vehicle = driver?.vehicles?.[0];

	const markers = [];
	if (driverLocation) {
		markers.push({
			id: 'driver',
			latitude: driverLocation.lat,
			longitude: driverLocation.lng,
			title: 'Motorista',
		});
	}
	if (currentLocation) {
		markers.push({
			id: 'user',
			latitude: currentLocation.latitude,
			longitude: currentLocation.longitude,
			title: 'Minha posição',
		});
	}

	const routeCoords = mapRoute
		? mapRoute.geometry.coordinates.map(([lng, lat]) => ({
				latitude: lat,
				longitude: lng,
			}))
		: [];

	const handleCancelPress = () => {
		setShowCancelInput(true);
	};

	const handleConfirmCancel = () => {
		if (!cancelReason.trim()) {
			Alert.alert('Atenção', 'Informe o motivo do cancelamento');
			return;
		}

		Alert.alert(
			'Cancelar Viagem',
			'Tem certeza que deseja cancelar esta viagem?',
			[
				{ text: 'Não', style: 'cancel' },
				{
					text: 'Sim, Cancelar',
					style: 'destructive',
					onPress: () => {
						cancelMutation.mutate(
							{ id: tripId, reason: cancelReason },
							{
								onSuccess: () => {
									setShowCancelInput(false);
									navigation.replace('TripDetail', { tripId });
								},
							},
						);
					},
				},
			],
		);
	};

	const handleCallDriver = () => {
		if (driver?.user?.phoneNumber) {
			Linking.openURL(`tel:${driver.user.phoneNumber}`);
		}
	};

	const handleViewDetail = () => {
		navigation.replace('TripDetail', { tripId });
	};

	if (isLoading) {
		return (
			<SafeAreaView
				className="flex-1"
				style={{ backgroundColor: themeColors.background }}
			>
				<View className="flex-1 px-5 pt-4">
					<View
						className="h-10 w-48 rounded-lg mb-6"
						style={{ backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }}
					/>
					<View
						className="flex-1 rounded-2xl mb-6"
						style={{ backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }}
					/>
					<View className="flex-row items-center mb-4">
						<View
							className="w-14 h-14 rounded-full mr-3"
							style={{ backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }}
						/>
						<View className="flex-1">
							<View
								className="h-4 w-32 rounded mb-2"
								style={{ backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }}
							/>
							<View
								className="h-3 w-24 rounded"
								style={{ backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }}
							/>
						</View>
					</View>
					<View
						className="h-24 rounded-2xl mb-4"
						style={{ backgroundColor: isDark ? '#2A2A2A' : '#E5E7EB' }}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const isTerminal = trip?.status === 'COMPLETED' || trip?.status === 'CANCELLED';
	const mapCenter = currentLocation ?? { latitude: -8.8399, longitude: 13.2344 };

	return (
		<SafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.background }}
		>
			<View className="flex-row items-center justify-between px-4 py-3">
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
				>
					<Ionicons
						name={isTerminal ? 'chevron-back' : 'close'}
						size={22}
						color={themeColors.text}
					/>
				</TouchableOpacity>
				<Text
					className="text-lg font-bold"
					style={{ color: themeColors.text }}
				>
					{isTerminal ? 'Viagem' : 'Viagem Ativa'}
				</Text>
				<View className="w-10" />
			</View>

			<View className="flex-1 mx-4 rounded-3xl overflow-hidden mb-4">
				<MapView
					style={{ flex: 1 }}
					initialRegion={{
						latitude: mapCenter.latitude,
						longitude: mapCenter.longitude,
						latitudeDelta: 0.02,
						longitudeDelta: 0.02,
					}}
					markers={markers}
					routeCoords={routeCoords}
				/>
			</View>

			<Animated.View
				entering={FadeInDown.duration(500)}
				className="mx-4 mb-4 p-5 rounded-3xl"
				style={{
					backgroundColor: isDark ? '#1A1A1A' : '#FFF',
					shadowColor: '#000',
					shadowOffset: { width: 0, height: -4 },
					shadowOpacity: 0.08,
					shadowRadius: 12,
					elevation: 8,
				}}
			>
				<View className="flex-row items-center mb-4">
					<View
						className="w-3 h-3 rounded-full mr-3"
						style={{ backgroundColor: statusInfo.color }}
					/>
					<Text
						className="text-base font-bold flex-1"
						style={{ color: themeColors.text }}
					>
						{statusInfo.label}
					</Text>
				</View>

				{trip && (
					<View className="mb-4 pl-1">
						<View className="flex-row items-start">
							<View className="w-4 items-center mr-3 mt-1">
								<View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
								<View className="w-0.5 h-5 bg-gray-300 dark:bg-gray-700 my-1" />
								<View className="w-2.5 h-2.5 rounded-full bg-primary" />
							</View>
							<View className="flex-1 gap-2">
								<Text
									className="text-sm font-semibold"
									style={{ color: themeColors.text }}
									numberOfLines={1}
								>
									{trip.pickupAddress}
								</Text>
								<Text
									className="text-sm font-semibold"
									style={{ color: themeColors.text }}
									numberOfLines={1}
								>
									{trip.dropoffAddress}
								</Text>
							</View>
						</View>
					</View>
				)}

				{driver && (
					<View
						className="flex-row items-center py-3 border-t mb-3"
						style={{ borderColor: isDark ? '#333' : '#F3F4F6' }}
					>
						<View className="w-12 h-12 rounded-full items-center justify-center bg-primary/20">
							<Ionicons name="person" size={24} color={themeColors.primary} />
						</View>
						<View className="flex-1 ml-3">
							<Text
								className="text-base font-bold"
								style={{ color: themeColors.text }}
							>
								{driver.user.name} {driver.user.surname}
							</Text>
							{vehicle && (
								<Text className="text-xs text-gray-500">
									{vehicle.brand} {vehicle.model} • {vehicle.plateNumber}
								</Text>
							)}
						</View>
						<TouchableOpacity
							onPress={handleCallDriver}
							className="w-10 h-10 rounded-full items-center justify-center bg-green-500/20"
						>
							<Ionicons name="call" size={20} color="#10B981" />
						</TouchableOpacity>
					</View>
				)}

				{trip && (
					<View
						className="flex-row justify-between items-center border-t pt-3"
						style={{ borderColor: isDark ? '#333' : '#F3F4F6' }}
					>
						<Text className="text-sm font-semibold text-gray-500">Total</Text>
						<Text
							className="text-xl font-black"
							style={{ color: themeColors.primary }}
						>
							{Number(trip.totalPrice).toLocaleString('pt-AO')} Kz
						</Text>
					</View>
				)}

				{!isTerminal && (
					<TouchableOpacity
						onPress={handleCancelPress}
						className="mt-4 py-3 rounded-2xl items-center bg-red-500/10 border border-red-500/20"
					>
						<Text className="text-base font-bold text-red-500">Cancelar Viagem</Text>
					</TouchableOpacity>
				)}

				{isTerminal && (
					<TouchableOpacity
						onPress={handleViewDetail}
						className="mt-4 py-3 rounded-2xl items-center bg-primary"
					>
						<Text className="text-base font-bold text-secondary">Ver Detalhes</Text>
					</TouchableOpacity>
				)}
			</Animated.View>

			<Modal visible={showCancelInput} animationType="slide" transparent>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1 justify-end"
				>
					<Pressable
						className="absolute inset-0 bg-black/50"
						onPress={() => {
							Keyboard.dismiss();
							setShowCancelInput(false);
						}}
					/>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View
							className="rounded-t-3xl p-6 pb-10"
							style={{
								backgroundColor: isDark ? '#121212' : '#FFF',
							}}
						>
							<Text
								className="text-lg font-bold mb-4"
								style={{ color: themeColors.text }}
							>
								Motivo do cancelamento
							</Text>

							<View
								className="px-4 py-3 rounded-2xl border mb-4"
								style={{
									backgroundColor: isDark ? '#1A1A1A' : '#F9FAFB',
									borderColor: isDark ? '#333' : '#E5E7EB',
								}}
							>
								<TextInput
									className="text-base"
									style={{ color: themeColors.text }}
									placeholder="Descreva o motivo..."
									placeholderTextColor="#9CA3AF"
									value={cancelReason}
									onChangeText={setCancelReason}
									autoFocus
								/>
							</View>

							<View className="flex-row gap-3">
								<TouchableOpacity
									onPress={() => {
										Keyboard.dismiss();
										setShowCancelInput(false);
									}}
									className="flex-1 py-3 rounded-2xl items-center border"
									style={{ borderColor: isDark ? '#333' : '#E5E7EB' }}
								>
									<Text className="text-base font-bold text-gray-500">Voltar</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={handleConfirmCancel}
									className="flex-1 py-3 rounded-2xl items-center bg-red-500"
									disabled={cancelMutation.isPending}
								>
									{cancelMutation.isPending ? (
										<ActivityIndicator color="#FFF" />
									) : (
										<Text className="text-base font-bold text-white">Confirmar</Text>
									)}
								</TouchableOpacity>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}
