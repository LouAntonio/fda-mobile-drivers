import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	ScrollView,
	Alert,
	Modal,
	ActivityIndicator,
	AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
	useSharedValue,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAuthStore } from '../../store/authStore';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import { useDriverAvailability } from '../../hooks/useDriverAvailability';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import {
	useTripOfferListener,
	useAcceptAssignment,
	useRejectAssignment,
} from '../../hooks/useTripAssignments';
import SideMenu from '../../components/SideMenu';
import type { DriverAvailability } from '../../types/api';

function PulseCircle({ isOnline, size }: { isOnline: boolean; size: number }) {
	const pulse = useSharedValue(1);

	useEffect(() => {
		if (isOnline) {
			pulse.value = withRepeat(
				withSequence(
					withTiming(1.08, { duration: 1000 }),
					withTiming(1, { duration: 1000 }),
				),
				-1,
				true,
			);
		} else {
			pulse.value = withTiming(1, { duration: 300 });
		}
	}, [isOnline]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pulse.value }],
	}));

	return (
		<Animated.View
			style={[
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: isOnline ? '#10B981' : '#2A2A2A',
					justifyContent: 'center',
					alignItems: 'center',
					elevation: isOnline ? 12 : 4,
					shadowColor: isOnline ? '#10B981' : '#000',
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: isOnline ? 0.4 : 0.15,
					shadowRadius: isOnline ? 20 : 8,
				},
				animatedStyle,
			]}
		>
			<View className="items-center">
				<Ionicons
					name={isOnline ? 'flash' : 'flash-outline'}
					size={40}
					color={isOnline ? '#FFF' : '#6B7280'}
				/>
				<Text
					className={`text-xs font-black mt-1 ${isOnline ? 'text-white' : 'text-gray-400'}`}
				>
					{isOnline ? 'ONLINE' : 'OFFLINE'}
				</Text>
			</View>
		</Animated.View>
	);
}

export default function DriverHomeScreen() {
	const navigation = useNavigation<any>();
	const { themeColors, isDark } = useThemeColors();
	const user = useAuthStore((state) => state.user);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const {
		data: driverProfile,
		isLoading: profileLoading,
		refetch,
	} = useDriverProfile();
	const availabilityMutation = useDriverAvailability();
	const { currentOffer, dismissOffer } = useTripOfferListener();
	const acceptMutation = useAcceptAssignment();
	const rejectMutation = useRejectAssignment();

	const isOnline = driverProfile?.availability === 'ONLINE';
	const complianceStatus = driverProfile?.complianceStatus;
	const isApproved = complianceStatus === 'APPROVED';

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	useDriverLocation({ enabled: isOnline && isApproved });

	const handleToggleAvailability = () => {
		if (!isApproved) {
			Alert.alert(
				'Conta Pendente',
				'Aguarde a aprovação dos seus documentos para ficar online',
			);
			return;
		}
		const newStatus: DriverAvailability = isOnline ? 'OFFLINE' : 'ONLINE';
		availabilityMutation.mutate(newStatus);
	};

	const handleAcceptOffer = () => {
		if (!currentOffer) return;
		acceptMutation.mutate(currentOffer.assignmentId, {
			onSuccess: () => {
				dismissOffer();
				navigation.navigate('ActiveTrip', {
					tripId: currentOffer.tripId,
				});
			},
		});
	};

	const handleRejectOffer = () => {
		if (!currentOffer) return;
		rejectMutation.mutate(currentOffer.assignmentId, {
			onSuccess: () => dismissOffer(),
		});
	};

	const ratingRounded = driverProfile
		? Math.round(driverProfile.ratingAverage * 10) / 10
		: 0;
	const balance = driverProfile?.availableBalance ?? 0;
	const pendingBalance = driverProfile?.pendingBalance ?? 0;
	const completedTrips = driverProfile?.completedTripsCount ?? 0;
	const cancelledTrips = driverProfile?.cancelledTripsCount ?? 0;

	useEffect(() => {
		const sub = AppState.addEventListener('change', (state) => {
			if (state === 'active') refetch();
		});
		return () => sub.remove();
	}, [refetch]);

	return (
		<SafeAreaView className="flex-1 bg-off-white dark:bg-[#090909]">
			<SideMenu
				isOpen={isMenuOpen}
				onClose={toggleMenu}
				userName={user?.name || 'Motorista'}
			/>

			{/* Header */}
			<View className="flex-row items-center px-5 py-3">
				<Image
					source={require('../../../assets/images/logo.png')}
					className="w-11 h-11 rounded-xl"
					resizeMode="cover"
				/>
				<View className="flex-1 ml-3">
					<Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
						Motorista
					</Text>
					<Text
						className="text-lg font-black text-secondary dark:text-off-white mt-0.5"
						numberOfLines={1}
					>
						{user?.name?.split(' ')[0] || 'Motorista'}
					</Text>
				</View>
				<TouchableOpacity
					onPress={toggleMenu}
					className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
					activeOpacity={0.7}
				>
					<Ionicons
						name="menu-outline"
						size={24}
						color={themeColors.text}
					/>
				</TouchableOpacity>
			</View>

			<ScrollView
				className="flex-1 px-5"
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Online Toggle — Hero */}
				<Animated.View
					entering={FadeInDown.duration(800)}
					className="items-center mt-6 mb-2"
				>
					<TouchableOpacity
						onPress={handleToggleAvailability}
						activeOpacity={0.8}
						disabled={
							availabilityMutation.isPending || profileLoading
						}
					>
						{availabilityMutation.isPending ? (
							<View className="w-36 h-36 rounded-full items-center justify-center bg-gray-300 dark:bg-[#2A2A2A]">
								<ActivityIndicator
									size="large"
									color={themeColors.primary}
								/>
							</View>
						) : (
							<PulseCircle isOnline={isOnline} size={144} />
						)}
					</TouchableOpacity>
					<Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-4">
						Toque para {isOnline ? 'ficar offline' : 'ficar online'}
					</Text>
				</Animated.View>

				{/* Earnings Card */}
				<Animated.View
					entering={FadeInDown.duration(800).delay(150)}
					className="rounded-3xl p-5 mt-2"
					style={{
						backgroundColor: themeColors.primary,
						elevation: 6,
						shadowColor: themeColors.primary,
						shadowOffset: { width: 0, height: 6 },
						shadowOpacity: 0.2,
						shadowRadius: 16,
					}}
				>
					<View className="flex-row items-center justify-between">
						<View>
							<Text className="text-xs font-bold text-secondary/60 uppercase tracking-widest">
								Disponível
							</Text>
							<Text className="text-3xl font-black text-secondary mt-1">
								{Number(balance).toLocaleString('pt-AO')} Kz
							</Text>
						</View>
						<View className="items-end">
							<Text className="text-xs font-bold text-secondary/60 uppercase tracking-widest">
								Pendente
							</Text>
							<Text className="text-base font-black text-secondary mt-1">
								{Number(pendingBalance).toLocaleString('pt-AO')}{' '}
								Kz
							</Text>
						</View>
					</View>
					<TouchableOpacity
						onPress={() => navigation.navigate('DriverEarnings')}
						className="mt-4 py-3 rounded-2xl items-center bg-secondary/10 active:opacity-70"
					>
						<Text className="text-sm font-black text-secondary">
							Ver Ganhos
						</Text>
					</TouchableOpacity>
				</Animated.View>

				{/* Stats Mini-Cards */}
				<Animated.View
					entering={FadeInDown.duration(800).delay(250)}
					className="flex-row gap-3 mt-5"
				>
					{[
						{
							icon: 'star',
							value: String(ratingRounded),
							label: 'Avaliação',
							color: themeColors.primary,
						},
						{
							icon: 'checkmark-circle',
							value: String(completedTrips),
							label: 'Viagens',
							color: '#10B981',
						},
						{
							icon: 'close-circle',
							value: String(cancelledTrips),
							label: 'Canceladas',
							color: '#ED1C24',
						},
					].map((item, i) => (
						<Animated.View
							key={item.label}
							entering={FadeInDown.duration(800).delay(
								300 + i * 80,
							)}
							className="flex-1 rounded-2xl p-4 items-center"
							style={{
								backgroundColor: isDark ? '#1A1A1A' : '#FFF',
								elevation: 2,
								shadowColor: '#000',
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.05,
								shadowRadius: 8,
							}}
						>
							<Ionicons
								name={item.icon as any}
								size={24}
								color={item.color}
							/>
							<Text className="text-lg font-black text-secondary dark:text-off-white mt-2">
								{item.value}
							</Text>
							<Text className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">
								{item.label}
							</Text>
						</Animated.View>
					))}
				</Animated.View>

				{/* Compliance — only if not approved */}
				{!isApproved && driverProfile && (
					<Animated.View
						entering={FadeInDown.duration(800).delay(400)}
						className="mt-5"
					>
						<View className="flex-row items-center gap-3 rounded-2xl p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
							<View className="w-10 h-10 rounded-xl items-center justify-center bg-amber-500/20">
								<Ionicons
									name="warning-outline"
									size={22}
									color="#F59E0B"
								/>
							</View>
							<View className="flex-1">
								<Text className="text-sm font-bold text-amber-800 dark:text-amber-400">
									{complianceStatus === 'PENDING'
										? 'Documentos pendentes'
										: complianceStatus === 'REJECTED'
											? 'Documentos rejeitados'
											: 'Conta suspensa'}
								</Text>
								<Text className="text-xs font-medium text-amber-700 dark:text-amber-500 mt-0.5">
									{complianceStatus === 'PENDING'
										? 'Aguarde a aprovação dos seus documentos'
										: 'Contacte o suporte para resolver'}
								</Text>
							</View>
						</View>
					</Animated.View>
				)}
			</ScrollView>

			{/* Trip Offer Modal */}
			<Modal
				visible={!!currentOffer && !acceptMutation.isPending}
				animationType="slide"
				transparent
			>
				<View className="flex-1 justify-end bg-black/50">
					<Animated.View
						entering={FadeInDown.duration(400)}
						className="rounded-t-[32px] p-6 pb-10"
						style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFF' }}
					>
						<View className="flex-row items-center gap-3 mb-5">
							<View
								className="w-12 h-12 rounded-2xl items-center justify-center"
								style={{ backgroundColor: '#10B981' }}
							>
								<Ionicons name="car" size={26} color="#FFF" />
							</View>
							<View>
								<Text className="text-xl font-black text-secondary dark:text-off-white">
									Nova Viagem
								</Text>
								<Text className="text-xs font-bold text-gray-500">
									Oportunidade de ganho
								</Text>
							</View>
						</View>

						{currentOffer && (
							<View className="gap-4 mb-6">
								{/* Route */}
								<View className="flex-row items-start gap-3">
									<View className="items-center">
										<View className="w-3 h-3 rounded-full bg-blue-500" />
										<View className="w-0.5 h-6 bg-gray-300 dark:bg-gray-700 my-1" />
										<View className="w-3 h-3 rounded-full bg-primary" />
									</View>
									<View className="flex-1 gap-2">
										<Text
											className="text-sm font-bold text-secondary dark:text-off-white"
											numberOfLines={2}
										>
											{currentOffer.pickupAddress}
										</Text>
										<Text
											className="text-sm font-bold text-secondary dark:text-off-white"
											numberOfLines={2}
										>
											{currentOffer.dropoffAddress}
										</Text>
									</View>
								</View>

								{/* Info Row */}
								<View className="flex-row gap-3">
									{[
										{
											label: 'Distância',
											value: `${currentOffer.estimatedDistanceKm?.toFixed(1)} km`,
										},
										{
											label: 'Duração',
											value: `${currentOffer.estimatedDurationMin} min`,
										},
										{
											label: 'Ganho',
											value: `${Number(currentOffer.totalPrice).toLocaleString('pt-AO')} Kz`,
											accent: true,
										},
									].map((info) => (
										<View
											key={info.label}
											className="flex-1 items-center py-3 rounded-2xl"
											style={{
												backgroundColor: isDark
													? '#2A2A2A'
													: '#F3F4F6',
											}}
										>
											<Text
												className={`text-sm font-black ${info.accent ? 'text-primary' : 'text-secondary dark:text-off-white'}`}
											>
												{info.value}
											</Text>
											<Text className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">
												{info.label}
											</Text>
										</View>
									))}
								</View>
							</View>
						)}

						<View className="flex-row gap-3">
							<TouchableOpacity
								onPress={handleRejectOffer}
								className="flex-1 py-4 rounded-2xl items-center bg-red-500/10 border border-red-500/20"
								disabled={rejectMutation.isPending}
							>
								{rejectMutation.isPending ? (
									<ActivityIndicator color="#EF4444" />
								) : (
									<Text className="text-base font-black text-red-500">
										Recusar
									</Text>
								)}
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleAcceptOffer}
								className="flex-1 py-4 rounded-2xl items-center"
								style={{ backgroundColor: '#10B981' }}
								disabled={acceptMutation.isPending}
							>
								{acceptMutation.isPending ? (
									<ActivityIndicator color="#FFF" />
								) : (
									<Text className="text-base font-black text-white">
										Aceitar
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</Animated.View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}
