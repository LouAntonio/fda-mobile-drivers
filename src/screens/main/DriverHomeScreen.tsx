import React, { useState, useMemo, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	ScrollView,
	Alert,
	Modal,
	ActivityIndicator,
	AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAuthStore } from '../../store/authStore';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import { useDriverAvailability } from '../../hooks/useDriverAvailability';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { useTripOfferListener, useAcceptAssignment, useRejectAssignment } from '../../hooks/useTripAssignments';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import SideMenu from '../../components/SideMenu';
import type { DriverAvailability } from '../../types/api';

export default function DriverHomeScreen() {
	const navigation = useNavigation<any>();
	const { themeColors, isDark } = useThemeColors();
	const user = useAuthStore((state) => state.user);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const { data: driverProfile, isLoading: profileLoading, refetch } = useDriverProfile();
	const availabilityMutation = useDriverAvailability();
	const { currentOffer, dismissOffer } = useTripOfferListener();
	const acceptMutation = useAcceptAssignment();
	const rejectMutation = useRejectAssignment();
	const { location: currentLocation } = useCurrentLocation();

	const isOnline = driverProfile?.availability === 'ONLINE';
	const complianceStatus = driverProfile?.complianceStatus;
	const isApproved = complianceStatus === 'APPROVED';

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	useDriverLocation({ enabled: isOnline && isApproved });

	const handleToggleAvailability = () => {
		if (!isApproved) {
			Alert.alert('Conta Pendente', 'Aguarde a aprovação dos seus documentos para ficar online');
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
				navigation.navigate('ActiveTrip', { tripId: currentOffer.tripId });
			},
		});
	};

	const handleRejectOffer = () => {
		if (!currentOffer) return;
		rejectMutation.mutate(currentOffer.assignmentId, {
			onSuccess: () => dismissOffer(),
		});
	};

	const ratingRounded = driverProfile ? Math.round(driverProfile.ratingAverage * 10) / 10 : 0;
	const balance = driverProfile?.availableBalance ?? 0;
	const pendingBalance = driverProfile?.pendingBalance ?? 0;
	const completedTrips = driverProfile?.completedTripsCount ?? 0;

	useEffect(() => {
		const sub = AppState.addEventListener('change', (state) => {
			if (state === 'active') {
				refetch();
			}
		});
		return () => sub.remove();
	}, [refetch]);

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: themeColors.background }]}
		>
			<SideMenu
				isOpen={isMenuOpen}
				onClose={toggleMenu}
				userName={user?.name || 'Motorista'}
			/>

			<View style={[styles.header, { borderBottomColor: themeColors.border, backgroundColor: themeColors.background }]}>
				<Image
					source={require('../../../assets/images/logo.png')}
					style={styles.logo}
				/>
				<View style={styles.headerCenter}>
					<Text style={[styles.headerSubtitle, { color: themeColors.secondary }]}>
						Motorista
					</Text>
					<Text style={[styles.headerTitle, { color: themeColors.text }]} numberOfLines={1}>
						{user?.name?.split(' ')[0] || 'Motorista'}
					</Text>
				</View>
				<TouchableOpacity onPress={toggleMenu} style={styles.menuButton} activeOpacity={0.7}>
					<Ionicons name="menu-outline" size={32} color={themeColors.text} />
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Earnings Card */}
				<Animated.View entering={FadeInDown.duration(800).delay(100)} style={[styles.earningsCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
					<View style={styles.earningsRow}>
						<View style={styles.earningsItem}>
							<Text style={[styles.earningsLabel, { color: themeColors.secondary }]}>Disponível</Text>
							<Text style={[styles.earningsValue, { color: themeColors.text }]}>
								{Number(balance).toLocaleString('pt-AO')} Kz
							</Text>
						</View>
						<View style={styles.earningsDivider} />
						<View style={styles.earningsItem}>
							<Text style={[styles.earningsLabel, { color: themeColors.secondary }]}>Pendente</Text>
							<Text style={[styles.earningsValue, { color: themeColors.secondary }]}>
								{Number(pendingBalance).toLocaleString('pt-AO')} Kz
							</Text>
						</View>
					</View>
					<TouchableOpacity
						onPress={() => navigation.navigate('DriverEarnings')}
						style={[styles.earningsButton, { borderColor: themeColors.primary }]}
					>
						<Text style={[styles.earningsButtonText, { color: themeColors.primary }]}>Ver Ganhos</Text>
					</TouchableOpacity>
				</Animated.View>

				{/* Online Toggle */}
				<Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.onlineSection}>
					<TouchableOpacity
						onPress={handleToggleAvailability}
						style={[
							styles.onlineToggle,
							{
								backgroundColor: isOnline ? '#10B981' : isDark ? '#2A2A2A' : '#E5E7EB',
							},
						]}
						activeOpacity={0.8}
						disabled={availabilityMutation.isPending || profileLoading}
					>
						{availabilityMutation.isPending ? (
							<ActivityIndicator color={isOnline ? '#FFF' : '#000'} size="large" />
						) : (
							<>
								<Ionicons
									name={isOnline ? 'power' : 'power-outline'}
									size={48}
									color={isOnline ? '#FFF' : themeColors.text}
								/>
								<Text style={[styles.onlineText, { color: isOnline ? '#FFF' : themeColors.text }]}>
									{isOnline ? 'Ficar Offline' : 'Ficar Online'}
								</Text>
							</>
						)}
					</TouchableOpacity>
				</Animated.View>

				{/* Stats Row */}
				<Animated.View entering={FadeInDown.duration(800).delay(300)} style={styles.statsRow}>
					<View style={[styles.statCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
						<MaterialCommunityIcons name="star" size={24} color={themeColors.primary} />
						<Text style={[styles.statValue, { color: themeColors.text }]}>{ratingRounded}</Text>
						<Text style={[styles.statLabel, { color: themeColors.secondary }]}>Avaliação</Text>
					</View>
					<View style={[styles.statCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
						<MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
						<Text style={[styles.statValue, { color: themeColors.text }]}>{completedTrips}</Text>
						<Text style={[styles.statLabel, { color: themeColors.secondary }]}>Viagens</Text>
					</View>
					<View style={[styles.statCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
						<MaterialCommunityIcons name="account" size={24} color={themeColors.text} />
						<Text style={[styles.statValue, { color: themeColors.text }]}>
							{driverProfile?.ratingCount ?? 0}
						</Text>
						<Text style={[styles.statLabel, { color: themeColors.secondary }]}>Avaliações</Text>
					</View>
				</Animated.View>

				{/* Compliance Status */}
				{!isApproved && driverProfile && (
					<Animated.View entering={FadeInDown.duration(800).delay(400)} style={[styles.complianceCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFF3CD' }]}>
						<Ionicons name="warning-outline" size={20} color="#856404" />
						<Text style={[styles.complianceText, { color: '#856404' }]}>
							{complianceStatus === 'PENDING'
								? 'Documentos pendentes de aprovação'
								: complianceStatus === 'REJECTED'
									? 'Documentos rejeitados. Contacte o suporte.'
									: complianceStatus === 'SUSPENDED'
										? 'Conta suspensa. Contacte o suporte.'
										: 'Documentos em análise'}
						</Text>
					</Animated.View>
				)}
			</ScrollView>

			{/* Trip Offer Modal */}
			<Modal visible={!!currentOffer && !acceptMutation.isPending} animationType="slide" transparent>
				<View style={styles.offerOverlay}>
					<Animated.View entering={FadeInDown.duration(400)} style={[styles.offerCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
						<View style={styles.offerHeader}>
							<View style={styles.offerIconCircle}>
								<Ionicons name="car" size={28} color="#FFF" />
							</View>
							<Text style={[styles.offerTitle, { color: themeColors.text }]}>Nova Viagem</Text>
						</View>

						{currentOffer && (
							<View style={styles.offerBody}>
								<View style={styles.offerRouteRow}>
									<View style={styles.offerDot} />
									<Text style={[styles.offerAddress, { color: themeColors.text }]} numberOfLines={2}>
										{currentOffer.pickupAddress}
									</Text>
								</View>
								<View style={styles.offerRouteRow}>
									<View style={[styles.offerDot, styles.offerDotDest]} />
									<Text style={[styles.offerAddress, { color: themeColors.text }]} numberOfLines={2}>
										{currentOffer.dropoffAddress}
									</Text>
								</View>

								<View style={styles.offerInfoRow}>
									<View style={styles.offerInfoItem}>
										<Text style={[styles.offerInfoValue, { color: themeColors.text }]}>
											{currentOffer.estimatedDistanceKm?.toFixed(1)} km
										</Text>
										<Text style={[styles.offerInfoLabel, { color: themeColors.secondary }]}>Distância</Text>
									</View>
									<View style={styles.offerInfoItem}>
										<Text style={[styles.offerInfoValue, { color: themeColors.text }]}>
											{currentOffer.estimatedDurationMin} min
										</Text>
										<Text style={[styles.offerInfoLabel, { color: themeColors.secondary }]}>Duração</Text>
									</View>
									<View style={styles.offerInfoItem}>
										<Text style={[styles.offerInfoValue, { color: themeColors.primary }]}>
											{Number(currentOffer.totalPrice).toLocaleString('pt-AO')} Kz
										</Text>
										<Text style={[styles.offerInfoLabel, { color: themeColors.secondary }]}>Ganho</Text>
									</View>
								</View>
							</View>
						)}

						<View style={styles.offerActions}>
							<TouchableOpacity
								onPress={handleRejectOffer}
								style={[styles.offerButton, styles.offerRejectButton]}
								disabled={rejectMutation.isPending}
							>
								{rejectMutation.isPending ? (
									<ActivityIndicator color="#EF4444" />
								) : (
									<Text style={styles.offerRejectText}>Recusar</Text>
								)}
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleAcceptOffer}
								style={[styles.offerButton, styles.offerAcceptButton, { backgroundColor: '#10B981' }]}
								disabled={acceptMutation.isPending}
							>
								{acceptMutation.isPending ? (
									<ActivityIndicator color="#FFF" />
								) : (
									<Text style={styles.offerAcceptText}>Aceitar</Text>
								)}
							</TouchableOpacity>
						</View>
					</Animated.View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderBottomWidth: 0.5,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		zIndex: 10,
	},
	logo: { width: 45, height: 45, borderRadius: 12, resizeMode: 'cover' },
	headerCenter: { flex: 1, marginLeft: 14 },
	headerSubtitle: { fontSize: 11, fontWeight: '700', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 },
	headerTitle: { fontSize: 18, fontWeight: '900', marginTop: 1 },
	menuButton: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
	scrollContent: { paddingBottom: 40, paddingHorizontal: 20 },

	earningsCard: {
		borderRadius: 24,
		padding: 20,
		marginTop: 20,
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
	},
	earningsRow: { flexDirection: 'row', alignItems: 'center' },
	earningsItem: { flex: 1, alignItems: 'center' },
	earningsLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, opacity: 0.6 },
	earningsValue: { fontSize: 22, fontWeight: '900' },
	earningsDivider: { width: 1, height: 40, backgroundColor: 'rgba(128,128,128,0.2)', marginHorizontal: 16 },
	earningsButton: {
		marginTop: 16,
		paddingVertical: 10,
		borderRadius: 14,
		borderWidth: 1.5,
		alignItems: 'center',
	},
	earningsButtonText: { fontSize: 14, fontWeight: '800' },

	onlineSection: { alignItems: 'center', marginTop: 30, marginBottom: 10 },
	onlineToggle: {
		width: 160,
		height: 160,
		borderRadius: 80,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
	},
	onlineText: { fontSize: 14, fontWeight: '800', marginTop: 8, textAlign: 'center' },

	statsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
	statCard: {
		flex: 1,
		borderRadius: 20,
		padding: 16,
		alignItems: 'center',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
	},
	statValue: { fontSize: 20, fontWeight: '900', marginTop: 6 },
	statLabel: { fontSize: 11, fontWeight: '700', marginTop: 2, opacity: 0.6 },

	complianceCard: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 16,
		padding: 16,
		marginTop: 20,
		gap: 10,
	},
	complianceText: { fontSize: 13, fontWeight: '600', flex: 1 },

	offerOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	offerCard: {
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
		padding: 24,
		paddingBottom: 40,
	},
	offerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 14 },
	offerIconCircle: {
		width: 52,
		height: 52,
		borderRadius: 16,
		backgroundColor: '#10B981',
		justifyContent: 'center',
		alignItems: 'center',
	},
	offerTitle: { fontSize: 22, fontWeight: '900' },
	offerBody: { marginBottom: 24 },
	offerRouteRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
	offerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6', marginTop: 4 },
	offerDotDest: { backgroundColor: '#EF4444' },
	offerAddress: { fontSize: 15, fontWeight: '600', flex: 1, lineHeight: 20 },
	offerInfoRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
	offerInfoItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: 'rgba(128,128,128,0.08)' },
	offerInfoValue: { fontSize: 16, fontWeight: '900' },
	offerInfoLabel: { fontSize: 11, fontWeight: '700', marginTop: 2, opacity: 0.6 },
	offerActions: { flexDirection: 'row', gap: 12 },
	offerButton: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
	offerRejectButton: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
	offerRejectText: { fontSize: 16, fontWeight: '800', color: '#EF4444' },
	offerAcceptButton: {},
	offerAcceptText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
});
