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
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
	FadeInDown,
	FadeInUp,
	FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { StatCard } from '../../components/profile/StatCard';
import { TripCard, TripItem } from '../../components/profile/TripCard';
import { fetchProfile } from '../../api/profile';
import { fetchProfileStats, type ProfileStats } from '../../api/stats';
import { useTrips } from '../../hooks/useTrips';
import { logoutUser } from '../../services/auth';
import { updateProfile } from '../../services/user';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ProfileScreen() {
	const navigation = useNavigation();
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

	const statsQuery = useQuery({
		queryKey: ['profile', 'stats'],
		queryFn: fetchProfileStats,
	});

	const {
		data: tripsData,
		isLoading: tripsLoading,
	} = useTrips({ limit: 10 });

	const updateMutation = useMutation({
		mutationFn: updateProfile,
		onSuccess: (res) => {
			const data = res.data as unknown as { data: import('../../store/authStore').User & { name: string; surname: string } };
			if (data?.data) {
				setUser(data.data as any);
			}
			profileQuery.refetch();
			statsQuery.refetch();
			setShowEditModal(false);
			Alert.alert('Sucesso', 'Perfil atualizado!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao atualizar perfil.');
		},
	});

	const handleLogout = () => {
		Alert.alert('Sair da Conta', 'Tem certeza que deseja sair?', [
			{
				text: 'Cancelar',
				style: 'cancel',
			},
			{
				text: 'Sair',
				style: 'destructive',
				onPress: async () => {
					if (refreshToken) {
						try {
							await logoutUser(refreshToken);
						} catch {
							// Ignore API error on logout
						}
					}
					logout();
					(navigation as any).reset({
						index: 0,
						routes: [{ name: 'Auth' }],
					});
				},
			},
		]);
	};

	const onRefresh = useCallback(() => {
		profileQuery.refetch();
		statsQuery.refetch();
	}, [profileQuery, statsQuery]);

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

	const isLoading = profileQuery.isLoading || tripsLoading || statsQuery.isLoading;
	const error = profileQuery.error;
	const user = profileQuery.data?.user;
	const stats: ProfileStats | undefined = statsQuery.data?.stats;

	const trips: TripItem[] = (tripsData?.pages?.[0]?.trips ?? []).map((t) => ({
		...t,
		totalPrice: Number(t.totalPrice),
	})) as TripItem[];

	const statCards = stats
		? [
				{
					id: '1',
					label: 'Viagens',
					value: String(stats.totalTrips),
					icon: 'bicycle',
					color: '#FFD700',
					bgColor: '#FFF9E0',
				},
				{
					id: '2',
					label: 'Distância',
					value: `${stats.totalDistanceKm.toFixed(0)} km`,
					icon: 'location-sharp',
					color: '#10B981',
					bgColor: '#E8FDF5',
				},
				{
					id: '3',
					label: 'Tempo',
					value: formatDuration(stats.totalDurationMin),
					icon: 'time-sharp',
					color: '#3B82F6',
					bgColor: '#EBF5FF',
				},
				{
					id: '4',
					label: 'Total Gasto',
					value: `${stats.totalSpent.toLocaleString('pt-AO')} Kz`,
					icon: 'wallet-sharp',
					color: '#8B5CF6',
					bgColor: '#F3EEFF',
				},
			]
		: [];

	return (
		<SafeAreaView className="flex-1 bg-off-white dark:bg-[#090909]">
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
				<TouchableOpacity
					className="p-2"
					onPress={() => navigation.goBack()}
					activeOpacity={0.7}
				>
					<Ionicons name="chevron-back" size={28} color="#231F20" />
				</TouchableOpacity>
				<Text className="text-lg font-bold text-secondary dark:text-off-white">
					Meu Perfil
				</Text>
				<View className="w-8" />
			</View>

			<ScrollView
				className="px-4 pb-10"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						onRefresh={onRefresh}
					/>
				}
			>
				{error ? (
					<View className="mt-10 items-center">
						<Ionicons
							name="cloud-offline-outline"
							size={48}
							color="#9CA3AF"
						/>
						<Text className="text-gray-400 dark:text-gray-500 mt-3">
							Erro ao carregar perfil
						</Text>
						<TouchableOpacity
							onPress={onRefresh}
							className="mt-4 bg-primary px-6 py-2 rounded-full"
							activeOpacity={0.7}
						>
							<Text className="font-bold text-secondary">
								Tentar novamente
							</Text>
						</TouchableOpacity>
					</View>
				) : (
					<>
						<Animated.View
							entering={FadeInDown.duration(600)}
							className="mt-5 mb-2"
						>
							<ProfileHeader
								name={user?.name || 'Usuário'}
								surname={user?.surname || ''}
								phoneNumber={
									user?.phoneNumber || '+244 --- --- ---'
								}
								email={user?.email}
								image={user?.image}
								phoneNumberVerified={user?.phoneNumberVerified}
								emailVerified={user?.emailVerified}
								onEditPress={handleEditPress}
							/>
						</Animated.View>

						<Animated.View
							entering={FadeInDown.duration(600).delay(150)}
							className="mt-6"
						>
							<Text className="text-xl font-extrabold text-secondary dark:text-off-white mb-4 tracking-tight">
								Estatísticas
							</Text>
							<View className="flex-row flex-wrap justify-between -mx-1">
								{statCards.map((s, index) => (
									<Animated.View
										key={s.id}
										entering={FadeInUp.duration(500).delay(
											200 + index * 100,
										)}
										className="w-[48%]"
									>
										<StatCard stat={s} />
									</Animated.View>
								))}
							</View>
						</Animated.View>

						<Animated.View
							entering={FadeInDown.duration(600).delay(300)}
							className="mt-6"
						>
							<View className="flex-row justify-between items-center mb-4">
								<Text className="text-xl font-extrabold text-secondary dark:text-off-white tracking-tight">
									Viagens Recentes
								</Text>
								<TouchableOpacity
									activeOpacity={0.7}
									className="py-1"
									onPress={() => navigation.navigate('History' as never)}
								>
									<Text className="text-sm font-bold text-primary">
										Ver todos
									</Text>
								</TouchableOpacity>
							</View>

							{trips.length === 0 ? (
								<View className="bg-white dark:bg-soft-black rounded-2xl p-8 items-center">
									<Ionicons
										name="car-outline"
										size={40}
										color="#9CA3AF"
									/>
									<Text className="text-gray-400 dark:text-gray-500 mt-3 text-center">
										Nenhuma viagem ainda
									</Text>
								</View>
							) : (
								trips.map((trip, index) => (
									<Animated.View
										key={trip.id}
										entering={FadeInUp.duration(500).delay(
											350 + index * 80,
										)}
									>
										<TripCard
											trip={trip}
											onPress={() =>
												(navigation as any).navigate('TripDetail', {
													tripId: trip.id,
												})
											}
										/>
									</Animated.View>
								))
							)}
						</Animated.View>

						{(user?.emergencyContactName ||
							user?.emergencyContactPhone) && (
							<Animated.View
								entering={FadeInDown.duration(600).delay(450)}
								className="mt-6"
							>
								<Text className="text-xl font-extrabold text-secondary dark:text-off-white mb-4 tracking-tight">
									Contato de Emergência
								</Text>
								<View className="bg-white dark:bg-soft-black rounded-2xl p-5 shadow-sm">
									{user?.emergencyContactName && (
										<View className="flex-row items-center mb-2">
											<Ionicons
												name="person-outline"
												size={18}
												color="#6B7280"
											/>
											<Text className="text-base font-semibold text-secondary dark:text-off-white ml-3">
												{user.emergencyContactName}
											</Text>
										</View>
									)}
									{user?.emergencyContactPhone && (
										<View className="flex-row items-center">
											<Ionicons
												name="call-outline"
												size={18}
												color="#6B7280"
											/>
											<Text className="text-base text-gray-500 dark:text-gray-400 ml-3">
												{user.emergencyContactPhone}
											</Text>
										</View>
									)}
								</View>
							</Animated.View>
						)}

						<Animated.View
							entering={FadeInDown.duration(600).delay(500)}
							className="mt-8"
						>
							<TouchableOpacity
								className="flex-row items-center justify-center bg-white dark:bg-soft-black py-4 px-6 rounded-2xl shadow-sm active:opacity-70"
								onPress={handleLogout}
								activeOpacity={0.7}
							>
								<Ionicons
									name="log-out-outline"
									size={22}
									color="#ED1C24"
								/>
								<Text className="ml-3 text-base font-bold text-red-500">
									Sair da Conta
								</Text>
							</TouchableOpacity>
						</Animated.View>

						<Animated.View
							entering={FadeIn.duration(600).delay(550)}
							className="mt-8 mb-4 items-center"
						>
							<Text className="text-sm text-gray-400">
								Flash Delivery Angola v1.0.0
							</Text>
						</Animated.View>
					</>
				)}
			</ScrollView>

			<Modal
				visible={showEditModal}
				animationType="slide"
				transparent
				onRequestClose={() => setShowEditModal(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1 justify-end"
				>
					<Pressable
						className="absolute inset-0 bg-black/50"
						onPress={() => setShowEditModal(false)}
					/>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View className="bg-white dark:bg-[#121212] rounded-t-3xl p-6 pb-10">
							<View className="flex-row items-center justify-between mb-6">
								<Text className="text-2xl font-black text-gray-900 dark:text-white">
									Editar Perfil
								</Text>
								<TouchableOpacity
									onPress={() => setShowEditModal(false)}
									className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"
									activeOpacity={0.6}
								>
									<Ionicons
										name="close"
										size={20}
										color="#000"
									/>
								</TouchableOpacity>
							</View>

							<Input
								label="Nome"
								value={editName}
								onChangeText={setEditName}
								placeholder="Seu nome"
								leftIcon="person-outline"
							/>
							<Input
								label="Sobrenome"
								value={editSurname}
								onChangeText={setEditSurname}
								placeholder="Seu sobrenome"
								leftIcon="person-outline"
							/>

							<Button
								title="Salvar"
								onPress={handleSaveProfile}
								loading={updateMutation.isPending}
							/>
						</View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}

function formatDuration(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = Math.round(minutes % 60);
	if (h > 0) return `${h}h ${m}m`;
	return `${m}m`;
}
