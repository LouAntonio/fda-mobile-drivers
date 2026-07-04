import React, { useCallback, useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
	Modal,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Keyboard,
	TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { StatCard, StatItem } from '../../components/profile/StatCard';
import { TripCard, TripItem } from '../../components/profile/TripCard';
import { ProfileHeaderSkeleton } from '../../components/skeletons/ProfileHeaderSkeleton';
import { StatCardGridSkeleton } from '../../components/skeletons/StatCardSkeleton';
import { TripCardSkeleton } from '../../components/skeletons/TripCardSkeleton';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import { useTrips } from '../../hooks/useTrips';
import { logoutUser } from '../../services/auth';
import { updateProfile } from '../../services/user';
import { fetchProfile } from '../../api/profile';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ProfileScreen() {
	const navigation = useNavigation<any>();
	const logout = useAuthStore((state) => state.logout);
	const refreshToken = useAuthStore((state) => state.refreshToken);
	const setUser = useAuthStore((state) => state.setUser);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editName, setEditName] = useState('');
	const [editSurname, setEditSurname] = useState('');

	const profileQuery = useQuery({
		queryKey: ['profile'],
		queryFn: fetchProfile,
	});

	const { data: driverProfile, isLoading: driverLoading, refetch: refetchDriver } = useDriverProfile();

	const { data: tripsData, isLoading: tripsLoading } = useTrips({ limit: 10 });

	const updateMutation = useMutation({
		mutationFn: updateProfile,
		onSuccess: (res) => {
			const data = res.data as unknown as { data: import('../../store/authStore').User & { name: string; surname: string } };
			if (data?.data) {
				setUser(data.data as any);
			}
			profileQuery.refetch();
			refetchDriver();
			setShowEditModal(false);
			Alert.alert('Sucesso', 'Perfil atualizado!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao atualizar perfil.');
		},
	});

	const handleLogout = () => {
		Alert.alert('Sair da Conta', 'Tem certeza que deseja sair?', [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Sair', style: 'destructive',
				onPress: async () => {
					if (refreshToken) {
						try { await logoutUser(refreshToken); } catch { }
					}
					logout();
					(navigation as any).reset({ index: 0, routes: [{ name: 'Auth' }] });
				},
			},
		]);
	};

	const onRefresh = useCallback(() => {
		profileQuery.refetch();
		refetchDriver();
	}, [profileQuery, refetchDriver]);

	const handleEditPress = () => {
		const user = profileQuery.data?.user;
		setEditName(user?.name || '');
		setEditSurname(user?.surname || '');
		setShowEditModal(true);
	};

	const handleSaveProfile = () => {
		if (!editName.trim()) {
			Alert.alert('Erro', 'O nome é obrigatório.');
			return;
		}
		updateMutation.mutate({ name: editName, surname: editSurname });
	};

	const isLoading = profileQuery.isLoading || tripsLoading || driverLoading;
	const error = profileQuery.error;
	const user = profileQuery.data?.user;

	const trips: TripItem[] = (tripsData?.pages?.[0]?.trips ?? []).map((t) => ({
		...t,
		totalPrice: Number(t.totalPrice),
	})) as TripItem[];

	const statCards: StatItem[] = driverProfile
		? [
			{ id: '1', label: 'Avaliação', value: String(Math.round(driverProfile.ratingAverage * 10) / 10) },
			{ id: '2', label: 'Viagens', value: String(driverProfile.completedTripsCount) },
			{ id: '3', label: 'Canceladas', value: String(driverProfile.cancelledTripsCount) },
			{ id: '4', label: 'Saldo', value: `${Number(driverProfile.availableBalance).toLocaleString('pt-AO')} Kz` },
		]
		: [];

	return (
		<SafeAreaView className="flex-1 bg-off-white dark:bg-[#090909]">
			<View className="flex-row items-center justify-between px-4 py-3">
				<TouchableOpacity className="p-2" onPress={() => navigation.goBack()} activeOpacity={0.7}>
					<Ionicons name="chevron-back" size={28} color="#231F20" />
				</TouchableOpacity>
				<Text className="text-lg font-bold text-secondary dark:text-off-white">Meu Perfil</Text>
				<View className="w-8" />
			</View>

			<ScrollView className="px-4 pb-10" showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
			>
				{error ? (
					<View className="mt-10 items-center">
						<Ionicons name="cloud-offline-outline" size={48} color="#9CA3AF" />
						<Text className="text-gray-400 dark:text-gray-500 mt-3">Erro ao carregar perfil</Text>
						<TouchableOpacity onPress={onRefresh} className="mt-4 bg-primary px-6 py-2 rounded-full">
							<Text className="font-bold text-secondary">Tentar novamente</Text>
						</TouchableOpacity>
					</View>
				) : isLoading ? (
					<View className="mt-5">
						<ProfileHeaderSkeleton />
						<View className="mt-6"><StatCardGridSkeleton /></View>
						<View className="mt-6">
							<TripCardSkeleton /><TripCardSkeleton /><TripCardSkeleton />
						</View>
					</View>
				) : (
					<>
						<Animated.View entering={FadeInDown.duration(600)} className="mt-5 mb-2">
							<ProfileHeader
								name={user?.name || 'Motorista'}
								surname={user?.surname || ''}
								phoneNumber={user?.phoneNumber || '+244 --- --- ---'}
								email={user?.email}
								image={user?.image}
								phoneNumberVerified={user?.phoneNumberVerified}
								emailVerified={user?.emailVerified}
								onEditPress={handleEditPress}
							/>
						</Animated.View>

						{/* Quick Links */}
						<Animated.View entering={FadeInDown.duration(600).delay(100)} className="mt-6">
							<View className="flex-row gap-3">
								<TouchableOpacity
									onPress={() => navigation.navigate('DriverEarnings')}
									className="flex-1 p-4 rounded-2xl items-center"
									style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFF', elevation: 2 }}
								>
									<Ionicons name="wallet-outline" size={24} color={themeColors.primary} />
									<Text className="text-xs font-bold mt-2" style={{ color: themeColors.text }}>Ganhos</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => navigation.navigate('DriverDocuments')}
									className="flex-1 p-4 rounded-2xl items-center"
									style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFF', elevation: 2 }}
								>
									<Ionicons name="document-text-outline" size={24} color={themeColors.primary} />
									<Text className="text-xs font-bold mt-2" style={{ color: themeColors.text }}>Documentos</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => navigation.navigate('DriverVehicle')}
									className="flex-1 p-4 rounded-2xl items-center"
									style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFF', elevation: 2 }}
								>
									<Ionicons name="car-outline" size={24} color={themeColors.primary} />
									<Text className="text-xs font-bold mt-2" style={{ color: themeColors.text }}>Veículo</Text>
								</TouchableOpacity>
							</View>
						</Animated.View>

						{/* Stats */}
						{driverProfile && (
							<Animated.View entering={FadeInDown.duration(600).delay(150)} className="mt-6">
								<Text className="text-xl font-extrabold text-secondary dark:text-off-white mb-4 tracking-tight">
									Estatísticas
								</Text>
								<View className="bg-white dark:bg-soft-black rounded-2xl p-4" style={{ elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' }}>
									<View className="flex-row flex-wrap">
										{statCards.map((s) => (
											<Animated.View key={s.id} entering={FadeInUp.duration(500).delay(200 + Number(s.id) * 60)} className="w-1/2">
												<StatCard stat={s} />
											</Animated.View>
										))}
									</View>
								</View>
							</Animated.View>
						)}

						{/* Compliance Status */}
						{driverProfile && (
							<Animated.View entering={FadeInDown.duration(600).delay(200)} className="mt-6">
								<Text className="text-xl font-extrabold text-secondary dark:text-off-white mb-4 tracking-tight">
									Compliance
								</Text>
								<View className="bg-white dark:bg-soft-black rounded-2xl p-4" style={{ elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' }}>
									<View className="flex-row items-center gap-3">
										<View className={`w-10 h-10 rounded-xl items-center justify-center ${driverProfile.complianceStatus === 'APPROVED' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
											<Ionicons
												name={driverProfile.complianceStatus === 'APPROVED' ? 'shield-checkmark' : 'shield-outline'}
												size={22}
												color={driverProfile.complianceStatus === 'APPROVED' ? '#10B981' : '#F59E0B'}
											/>
										</View>
										<View className="flex-1">
											<Text className="text-base font-bold" style={{ color: themeColors.text }}>
												{driverProfile.complianceStatus === 'APPROVED' ? 'Aprovado' :
													driverProfile.complianceStatus === 'PENDING' ? 'Pendente' :
														driverProfile.complianceStatus === 'REJECTED' ? 'Rejeitado' : 'Suspenso'}
											</Text>
											{driverProfile.complianceStatus !== 'APPROVED' && (
												<Text className="text-xs text-gray-500 mt-0.5">
													{driverProfile.complianceStatus === 'PENDING' ? 'Documentos em análise' : 'Contacte o suporte'}
												</Text>
											)}
										</View>
									</View>
								</View>
							</Animated.View>
						)}

						{/* Recent trips */}
						<Animated.View entering={FadeInDown.duration(600).delay(300)} className="mt-6">
							<View className="flex-row justify-between items-center mb-4">
								<Text className="text-xl font-extrabold text-secondary dark:text-off-white tracking-tight">
									Viagens Recentes
								</Text>
								<TouchableOpacity activeOpacity={0.7} className="py-1" onPress={() => navigation.navigate('History')}>
									<Text className="text-sm font-bold text-primary">Ver todos</Text>
								</TouchableOpacity>
							</View>
							{trips.length === 0 ? (
								<View className="bg-white dark:bg-soft-black rounded-2xl p-8 items-center">
									<Ionicons name="car-outline" size={40} color="#9CA3AF" />
									<Text className="text-gray-400 dark:text-gray-500 mt-3 text-center">Nenhuma viagem ainda</Text>
								</View>
							) : (
								trips.map((trip, index) => (
									<Animated.View key={trip.id} entering={FadeInUp.duration(500).delay(350 + index * 80)}>
										<TripCard trip={trip} onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })} />
									</Animated.View>
								))
							)}
						</Animated.View>

						{/* Emergency contact */}
						{(user?.emergencyContactName || user?.emergencyContactPhone) && (
							<Animated.View entering={FadeInDown.duration(600).delay(450)} className="mt-6">
								<Text className="text-xl font-extrabold text-secondary dark:text-off-white mb-4 tracking-tight">Contato de Emergência</Text>
								<View className="bg-white dark:bg-soft-black rounded-2xl p-4 flex-row items-center gap-4" style={{ elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' }}>
									<View className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 items-center justify-center">
										<Ionicons name="medkit-outline" size={22} color="#ED1C24" />
									</View>
									<View className="flex-1">
										{user?.emergencyContactName && (
											<Text className="text-base font-bold text-secondary dark:text-off-white">{user.emergencyContactName}</Text>
										)}
										{user?.emergencyContactPhone && (
											<Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{user.emergencyContactPhone}</Text>
										)}
									</View>
									<Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
								</View>
							</Animated.View>
						)}

						<Animated.View entering={FadeInDown.duration(600).delay(500)} className="mt-8 items-center">
							<TouchableOpacity className="flex-row items-center gap-2 py-3 px-6 active:opacity-60" onPress={handleLogout} activeOpacity={0.7}>
								<Ionicons name="log-out-outline" size={18} color="#ED1C24" />
								<Text className="text-sm font-bold text-red-500">Sair da Conta</Text>
							</TouchableOpacity>
						</Animated.View>

						<Animated.View entering={FadeIn.duration(600).delay(550)} className="mt-4 mb-4 items-center">
							<Text className="text-xs text-gray-400">Flash Delivery Angola v1.0.0</Text>
						</Animated.View>
					</>
				)}
			</ScrollView>

			<Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end">
					<Pressable className="absolute inset-0 bg-black/50" onPress={() => setShowEditModal(false)} />
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View className="bg-white dark:bg-[#121212] rounded-t-3xl p-6 pb-10">
							<View className="flex-row items-center justify-between mb-6">
								<Text className="text-2xl font-black text-gray-900 dark:text-white">Editar Perfil</Text>
								<TouchableOpacity onPress={() => setShowEditModal(false)} className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
									<Ionicons name="close" size={20} color="#000" />
								</TouchableOpacity>
							</View>
							<Input label="Nome" value={editName} onChangeText={setEditName} placeholder="Seu nome" leftIcon="person-outline" />
							<Input label="Sobrenome" value={editSurname} onChangeText={setEditSurname} placeholder="Seu sobrenome" leftIcon="person-outline" />
							<Button title="Salvar" onPress={handleSaveProfile} loading={updateMutation.isPending} />
						</View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}
