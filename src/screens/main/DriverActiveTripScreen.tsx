import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTrip } from '../../hooks/useTrips';
import {
	useUpdateTripStatus,
	useUpdateDeliveryStatus,
} from '../../hooks/useTrips';
import { useActiveTripSocket } from '../../hooks/useActiveTripSocket';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { useMapRoute } from '../../hooks/useMapRoute';
import MapView from '../../components/MapView';
import type { MainStackParamList } from '../../types/navigation';

function parseWktPoint(wkt: string): { lat: number; lng: number } | null {
	const match = wkt.match(/POINT\s*\(\s*([\d.-]+)\s+([\d.-]+)\s*\)/i);
	if (!match) return null;
	return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
}

const STEPS = [
	{ key: 'ACCEPTED', label: 'Pickup', icon: 'location' },
	{ key: 'PICKUP_IN_PROGRESS', label: 'Chegou', icon: 'checkmark' },
	{ key: 'STARTED', label: 'Viagem', icon: 'navigate' },
	{ key: 'COMPLETED', label: 'Concluir', icon: 'flag' },
];

const STATUS_CONFIG: Record<
	string,
	{ label: string; nextStatus?: string; nextLabel?: string; color: string }
> = {
	ACCEPTED: {
		label: 'A caminho do pickup',
		nextStatus: 'PICKUP_IN_PROGRESS',
		nextLabel: 'Cheguei ao Local',
		color: '#3B82F6',
	},
	PICKUP_IN_PROGRESS: {
		label: 'No local de pickup',
		nextStatus: 'STARTED',
		nextLabel: 'Iniciar Viagem',
		color: '#3B82F6',
	},
	STARTED: {
		label: 'Viagem em andamento',
		nextStatus: 'COMPLETED',
		nextLabel: 'Concluir Viagem',
		color: '#10B981',
	},
	COMPLETED: { label: 'Viagem concluída', color: '#10B981' },
	CANCELLED: { label: 'Viagem cancelada', color: '#EF4444' },
};

export default function DriverActiveTripScreen() {
	const navigation = useNavigation<any>();
	const route = useRoute<RouteProp<MainStackParamList, 'ActiveTrip'>>();
	const { themeColors, isDark } = useThemeColors();
	const { tripId } = route.params;

	const { data: trip, isLoading } = useTrip(tripId);
	const statusMutation = useUpdateTripStatus();
	const { clientLocation } = useActiveTripSocket({ tripId, enabled: true });
	const { location: currentLocation } = useCurrentLocation();
	const { route: mapRoute, fetchRoute } = useMapRoute();
	const isTripActive =
		!!trip && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED';
	useDriverLocation({ enabled: isTripActive, tripId });

	const [routeFetched, setRouteFetched] = useState(false);

	const pickupCoords = trip?.pickupCoords
		? parseWktPoint(trip.pickupCoords)
		: null;
	const dropoffCoords = trip?.dropoffCoords
		? parseWktPoint(trip.dropoffCoords)
		: null;

	useEffect(() => {
		if (!trip || routeFetched) return;
		if (trip.status === 'ACCEPTED' && pickupCoords && currentLocation) {
			fetchRoute(
				[currentLocation.longitude, currentLocation.latitude],
				[pickupCoords.lng, pickupCoords.lat],
			);
			setRouteFetched(true);
		} else if (
			pickupCoords &&
			dropoffCoords &&
			(trip.status === 'PICKUP_IN_PROGRESS' || trip.status === 'STARTED')
		) {
			if (trip.status === 'PICKUP_IN_PROGRESS') {
				fetchRoute(
					[
						currentLocation?.longitude ?? pickupCoords.lng,
						currentLocation?.latitude ?? pickupCoords.lat,
					],
					[pickupCoords.lng, pickupCoords.lat],
				);
			} else {
				fetchRoute(
					[pickupCoords.lng, pickupCoords.lat],
					[dropoffCoords.lng, dropoffCoords.lat],
				);
			}
			setRouteFetched(true);
		}
	}, [trip, currentLocation, pickupCoords, dropoffCoords]);

	const statusConfig = trip
		? (STATUS_CONFIG[trip.status] ?? STATUS_CONFIG.ACCEPTED)
		: STATUS_CONFIG.ACCEPTED;
	const client = trip?.client;
	const isTerminal =
		trip?.status === 'COMPLETED' || trip?.status === 'CANCELLED';

	const currentStepIndex = trip
		? STEPS.findIndex((s) => s.key === trip.status)
		: -1;

	const handleNextStatus = () => {
		if (!trip || !statusConfig.nextStatus) return;
		if (statusConfig.nextStatus === 'COMPLETED') {
			Alert.alert(
				'Concluir Viagem',
				'Tem certeza que deseja concluir esta viagem?',
				[
					{ text: 'Cancelar', style: 'cancel' },
					{
						text: 'Concluir',
						onPress: () => {
							statusMutation.mutate(
								{
									tripId: trip.id,
									status: 'COMPLETED' as const,
								},
								{
									onSuccess: () =>
										navigation.replace('TripDetail', {
											tripId: trip.id,
										}),
								},
							);
						},
					},
				],
			);
		} else {
			statusMutation.mutate({
				tripId: trip.id,
				status: statusConfig.nextStatus as any,
			});
		}
	};

	const handleCallClient = () => {
		if (client?.phoneNumber) Linking.openURL(`tel:${client.phoneNumber}`);
	};

	const handleCancel = () => {
		Alert.alert('Cancelar Viagem', 'Tem certeza?', [
			{ text: 'Não', style: 'cancel' },
			{
				text: 'Sim, Cancelar',
				style: 'destructive',
				onPress: () => {
					statusMutation.mutate(
						{
							tripId,
							status: 'CANCELLED' as const,
							cancelReason: 'Motorista cancelou',
						},
						{
							onSuccess: () =>
								navigation.replace('TripDetail', { tripId }),
						},
					);
				},
			},
		]);
	};

	const markers: any[] = [];
	if (currentLocation) {
		markers.push({
			id: 'driver',
			latitude: currentLocation.latitude,
			longitude: currentLocation.longitude,
			title: 'Minha posição',
		});
	}
	if (pickupCoords && trip && trip.status !== 'STARTED') {
		markers.push({
			id: 'pickup',
			latitude: pickupCoords.lat,
			longitude: pickupCoords.lng,
			title: trip.pickupAddress,
		});
	}
	if (dropoffCoords && trip && trip.status === 'STARTED') {
		markers.push({
			id: 'dropoff',
			latitude: dropoffCoords.lat,
			longitude: dropoffCoords.lng,
			title: trip.dropoffAddress,
		});
	}

	const routeCoords = mapRoute
		? mapRoute.geometry.coordinates.map(([lng, lat]: number[]) => ({
				latitude: lat,
				longitude: lng,
			}))
		: [];

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-off-white dark:bg-[#090909]">
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator
						size="large"
						color={themeColors.primary}
					/>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-off-white dark:bg-[#090909]">
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 py-3">
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
				<Text className="text-lg font-black text-secondary dark:text-off-white">
					{isTerminal ? 'Viagem' : 'Viagem Ativa'}
				</Text>
				<View className="w-10" />
			</View>

			{/* Map */}
			<View className="flex-1 mx-4 rounded-3xl overflow-hidden">
				<MapView
					style={{ flex: 1 }}
					initialRegion={{
						latitude: currentLocation?.latitude ?? -8.8399,
						longitude: currentLocation?.longitude ?? 13.2344,
						latitudeDelta: 0.02,
						longitudeDelta: 0.02,
					}}
					markers={markers}
					routeCoords={routeCoords}
				/>
			</View>

			{/* Bottom Sheet */}
			<Animated.View
				entering={FadeInDown.duration(500)}
				className="mx-4 mb-4 p-5 rounded-3xl"
				style={{
					backgroundColor: isDark ? '#1A1A1A' : '#FFF',
					shadowColor: '#000',
					shadowOffset: { width: 0, height: -4 },
					shadowOpacity: 0.1,
					shadowRadius: 16,
					elevation: 10,
				}}
			>
				{/* Step Indicator */}
				{!isTerminal && (
					<View className="flex-row items-center justify-between mb-5 px-1">
						{STEPS.filter(
							(s) =>
								s.key !== 'COMPLETED' ||
								trip?.status === 'COMPLETED',
						).map((step, i) => {
							const isActive = i === currentStepIndex;
							const isDone = i < currentStepIndex;
							return (
								<View
									key={step.key}
									className="flex-1 items-center"
								>
									<View
										className={`w-8 h-8 rounded-full items-center justify-center ${isDone ? 'bg-green-500' : isActive ? 'bg-primary' : isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}
									>
										{isDone ? (
											<Ionicons
												name="checkmark"
												size={16}
												color="#FFF"
											/>
										) : (
											<Ionicons
												name={step.icon as any}
												size={14}
												color={
													isActive
														? '#231F20'
														: isDark
															? '#666'
															: '#999'
												}
											/>
										)}
									</View>
									<Text
										className={`text-[9px] font-black mt-1 ${isDone ? 'text-green-500' : isActive ? 'text-primary' : 'text-gray-400'}`}
									>
										{step.label}
									</Text>
								</View>
							);
						})}
					</View>
				)}

				{/* Status */}
				<View className="flex-row items-center mb-3">
					<View
						className="w-3 h-3 rounded-full mr-3"
						style={{ backgroundColor: statusConfig.color }}
					/>
					<Text className="text-base font-black text-secondary dark:text-off-white flex-1">
						{statusConfig.label}
					</Text>
					{trip?.serviceType === 'DELIVERY' && (
						<View className="px-2.5 py-1 rounded-lg bg-primary/20">
							<Text className="text-[10px] font-black text-primary">
								Entrega
							</Text>
						</View>
					)}
				</View>

				{/* Route */}
				{trip && (
					<View className="mb-4 pl-1">
						<View className="flex-row items-start gap-3">
							<View className="items-center">
								<View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
								<View className="w-0.5 h-5 bg-gray-300 dark:bg-gray-700 my-0.5" />
								<View className="w-2.5 h-2.5 rounded-full bg-primary" />
							</View>
							<View className="flex-1 gap-1">
								<Text
									className="text-sm font-bold text-secondary dark:text-off-white"
									numberOfLines={1}
								>
									{trip.pickupAddress}
								</Text>
								<Text
									className="text-sm font-bold text-secondary dark:text-off-white"
									numberOfLines={1}
								>
									{trip.dropoffAddress}
								</Text>
							</View>
						</View>
					</View>
				)}

				{/* Client */}
				{client && (
					<View
						className="flex-row items-center py-3 border-t mb-3"
						style={{ borderColor: isDark ? '#333' : '#F3F4F6' }}
					>
						<View className="w-12 h-12 rounded-2xl items-center justify-center bg-primary/20">
							<Ionicons
								name="person"
								size={24}
								color={themeColors.primary}
							/>
						</View>
						<View className="flex-1 ml-3">
							<Text className="text-base font-black text-secondary dark:text-off-white">
								{client.name} {client.surname}
							</Text>
							<Text className="text-xs font-bold text-gray-500 dark:text-gray-400">
								Cliente
							</Text>
						</View>
						{client.phoneNumber && (
							<TouchableOpacity
								onPress={handleCallClient}
								className="w-10 h-10 rounded-full items-center justify-center bg-green-500/20"
							>
								<Ionicons
									name="call"
									size={20}
									color="#10B981"
								/>
							</TouchableOpacity>
						)}
					</View>
				)}

				{/* Actions */}
				{trip && !isTerminal && statusConfig.nextStatus && (
					<TouchableOpacity
						onPress={handleNextStatus}
						className="py-4 rounded-2xl items-center bg-primary active:opacity-70"
						style={{
							elevation: 4,
							shadowColor: themeColors.primary,
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.2,
							shadowRadius: 12,
						}}
						disabled={statusMutation.isPending}
					>
						{statusMutation.isPending ? (
							<ActivityIndicator color="#000" />
						) : (
							<Text className="text-base font-black text-secondary">
								{statusConfig.nextLabel}
							</Text>
						)}
					</TouchableOpacity>
				)}

				{trip && !isTerminal && (
					<TouchableOpacity
						onPress={handleCancel}
						className="mt-3 py-3 rounded-2xl items-center bg-red-500/10 border border-red-500/20 active:opacity-70"
					>
						<Text className="text-sm font-black text-red-500">
							Cancelar Viagem
						</Text>
					</TouchableOpacity>
				)}

				{isTerminal && (
					<TouchableOpacity
						onPress={() =>
							navigation.replace('TripDetail', { tripId })
						}
						className="py-4 rounded-2xl items-center bg-primary active:opacity-70"
					>
						<Text className="text-base font-black text-secondary">
							Ver Detalhes
						</Text>
					</TouchableOpacity>
				)}
			</Animated.View>
		</SafeAreaView>
	);
}
