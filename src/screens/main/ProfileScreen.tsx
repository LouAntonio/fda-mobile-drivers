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
	TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import { useTrips } from '../../hooks/useTrips';
import { logoutUser } from '../../services/auth';
import { updateProfile, updateEmergencyContact } from '../../services/user';
import { sendPhoneVerification, confirmPhoneVerification } from '../../services/phone';
import { fetchProfile } from '../../api/profile';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ProfileScreen() {
	const navigation = useNavigation<any>();
	const { themeColors, isDark } = useThemeColors();
	const logout = useAuthStore((state) => state.logout);
	const refreshToken = useAuthStore((state) => state.refreshToken);
	const setUser = useAuthStore((state) => state.setUser);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editName, setEditName] = useState('');
	const [editSurname, setEditSurname] = useState('');

	const [showEmergencyModal, setShowEmergencyModal] = useState(false);
	const [emergencyName, setEmergencyName] = useState('');
	const [emergencyPhone, setEmergencyPhone] = useState('');

	const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
	const [phoneOtpSent, setPhoneOtpSent] = useState(false);
	const [phoneOtpCode, setPhoneOtpCode] = useState('');

	const sendOtpMutation = useMutation({
		mutationFn: () => sendPhoneVerification(user?.phoneNumber || ''),
		onSuccess: () => {
			setPhoneOtpSent(true);
			Alert.alert('Código enviado', 'Insere o código de verificação enviado para o teu telefone.');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao enviar código.');
		},
	});

	const confirmOtpMutation = useMutation({
		mutationFn: () => confirmPhoneVerification(phoneOtpCode),
		onSuccess: () => {
			setShowPhoneVerificationModal(false);
			setPhoneOtpSent(false);
			setPhoneOtpCode('');
			profileQuery.refetch();
			refetchDriver();
			setUser({ ...user!, phoneNumberVerified: true });
			Alert.alert('Sucesso', 'Telefone verificado com sucesso!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Código inválido.');
		},
	});

	const handlePhoneVerificationPress = () => {
		if (user?.phoneNumberVerified) return;
		setPhoneOtpSent(false);
		setPhoneOtpCode('');
		setShowPhoneVerificationModal(true);
	};

	const emergencyMutation = useMutation({
		mutationFn: () =>
			updateEmergencyContact({
				emergencyContactName: emergencyName,
				emergencyContactPhone: emergencyPhone,
			}),
		onSuccess: () => {
			setShowEmergencyModal(false);
			profileQuery.refetch();
			refetchDriver();
			Alert.alert('Sucesso', 'Contacto de emergência atualizado!');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao atualizar contacto de emergência.');
		},
	});

	const profileQuery = useQuery({
		queryKey: ['profile'],
		queryFn: fetchProfile,
	});

	const { data: driverProfile, isLoading: driverLoading, refetch: refetchDriver } = useDriverProfile();

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

	const isLoading = profileQuery.isLoading || driverLoading;
	const error = profileQuery.error;
	const user = profileQuery.data?.user;

	const ratingRounded = driverProfile ? Math.round(driverProfile.ratingAverage * 10) / 10 : 0;
	const completedTrips = driverProfile?.completedTripsCount ?? 0;
	const cancelledTrips = driverProfile?.cancelledTripsCount ?? 0;
	const balance = driverProfile?.availableBalance ?? 0;
	const complianceStatus = driverProfile?.complianceStatus;

	const quickLinks = [
		{ icon: 'wallet-outline', label: 'Ganhos', screen: 'DriverEarnings' },
		{ icon: 'document-text-outline', label: 'Documentos', screen: 'DriverDocuments' },
		{ icon: 'car-outline', label: 'Veículo', screen: 'DriverVehicle' },
		{ icon: 'time-outline', label: 'Histórico', screen: 'History' },
	];

	return (
		<SafeAreaView className="flex-1 bg-off-white dark:bg-[#090909]">
			<View className="flex-row items-center justify-between px-5 py-3">
				<TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10" onPress={() => navigation.goBack()} activeOpacity={0.7}>
					<Ionicons name="chevron-back" size={22} color={themeColors.text} />
				</TouchableOpacity>
				<Text className="text-lg font-black text-secondary dark:text-off-white">Meu Perfil</Text>
				<TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-primary/10" onPress={handleEditPress} activeOpacity={0.7}>
					<Ionicons name="create-outline" size={18} color={themeColors.primary} />
				</TouchableOpacity>
			</View>

			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
			>
				{error ? (
					<View className="mt-16 items-center">
						<Ionicons name="cloud-offline-outline" size={48} color="#9CA3AF" />
						<Text className="text-base font-bold text-gray-400 dark:text-gray-500 mt-3">Erro ao carregar perfil</Text>
						<TouchableOpacity onPress={onRefresh} className="mt-5 bg-primary px-6 py-3 rounded-full">
							<Text className="text-sm font-black text-secondary">Tentar novamente</Text>
						</TouchableOpacity>
					</View>
				) : isLoading ? (
					<View className="mt-10 items-center">
						<View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-[#2A2A2A]" />
						<View className="h-5 w-40 bg-gray-200 dark:bg-[#2A2A2A] rounded-full mt-4" />
						<View className="h-4 w-28 bg-gray-200 dark:bg-[#2A2A2A] rounded-full mt-2" />
						<View className="flex-row gap-3 mt-8">
							{[1, 2, 3].map((i) => (
								<View key={i} className="flex-1 h-24 rounded-2xl bg-gray-200 dark:bg-[#2A2A2A]" />
							))}
						</View>
						<View className="flex-row gap-3 mt-4">
							{[1, 2, 3].map((i) => (
								<View key={i} className="flex-1 h-20 rounded-2xl bg-gray-200 dark:bg-[#2A2A2A]" />
							))}
						</View>
					</View>
				) : (
					<View>
						{/* Avatar + Name */}
						<Animated.View entering={FadeInDown.duration(600)} className="items-center mt-4">
							<View className="w-24 h-24 rounded-full bg-primary items-center justify-center" style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }}>
								<Text className="text-4xl font-black text-secondary">
									{`${user?.name?.charAt(0) || 'M'}${user?.surname?.charAt(0) || ''}`.toUpperCase()}
								</Text>
							</View>
							<Text className="text-2xl font-black text-secondary dark:text-off-white mt-4">
								{user?.name || 'Motorista'} {user?.surname || ''}
							</Text>
							<TouchableOpacity className="flex-row items-center gap-1 mt-1" onPress={handlePhoneVerificationPress} activeOpacity={0.7}>
								<Text className="text-sm font-bold text-gray-500 dark:text-gray-400">
									{user?.phoneNumber || '+244 --- --- ---'}
								</Text>
								{user?.phoneNumberVerified ? (
									<Ionicons name="checkmark-circle" size={16} color="#10B981" />
								) : (
									<Text className="text-xs font-black text-primary ml-1">Verificar</Text>
								)}
							</TouchableOpacity>
						</Animated.View>

						{/* Stats Row */}
						{driverProfile && (
							<Animated.View entering={FadeInDown.duration(600).delay(100)} className="flex-row gap-3 mt-6">
								{[
									{ icon: 'star', value: String(ratingRounded), label: 'Avaliação', color: themeColors.primary },
									{ icon: 'checkmark-circle', value: String(completedTrips), label: 'Viagens', color: '#10B981' },
									{ icon: 'wallet', value: `${Number(balance).toLocaleString('pt-AO')} Kz`, label: 'Saldo', color: themeColors.primary },
								].map((item, i) => (
									<Animated.View
										key={item.label}
										entering={FadeInDown.duration(600).delay(150 + i * 60)}
										className="flex-1 items-center py-4 rounded-2xl"
										style={{
											backgroundColor: isDark ? '#1A1A1A' : '#FFF',
											elevation: 2,
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.05,
											shadowRadius: 8,
										}}
									>
										<Ionicons name={item.icon as any} size={20} color={item.color} />
										<Text className="text-base font-black text-secondary dark:text-off-white mt-2" numberOfLines={1} adjustsFontSizeToFit>
											{item.value}
										</Text>
										<Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
											{item.label}
										</Text>
									</Animated.View>
								))}
							</Animated.View>
						)}

						{/* Quick Links */}
						<Animated.View entering={FadeInDown.duration(600).delay(200)} className="mt-6">
							<View className="flex-row flex-wrap gap-3">
								{quickLinks.map((link, i) => (
									<Animated.View
										key={link.label}
										entering={FadeInDown.duration(600).delay(250 + i * 60)}
										className="w-[calc(50%-6px)]"
									>
										<TouchableOpacity
											onPress={() => navigation.navigate(link.screen)}
											className="p-5 rounded-2xl items-center active:opacity-70"
											style={{
												backgroundColor: isDark ? '#1A1A1A' : '#FFF',
												elevation: 2,
												shadowColor: '#000',
												shadowOffset: { width: 0, height: 2 },
												shadowOpacity: 0.05,
												shadowRadius: 8,
											}}
										>
											<View className="w-12 h-12 rounded-2xl items-center justify-center bg-primary/10 mb-3">
												<Ionicons name={link.icon as any} size={24} color={themeColors.primary} />
											</View>
											<Text className="text-sm font-black text-secondary dark:text-off-white">{link.label}</Text>
										</TouchableOpacity>
									</Animated.View>
								))}
							</View>
						</Animated.View>

						{/* Compliance */}
						{driverProfile && (
							<Animated.View entering={FadeInDown.duration(600).delay(300)} className="mt-6">
								<View
									className="flex-row items-center gap-4 p-4 rounded-2xl"
									style={{
										backgroundColor: isDark ? '#1A1A1A' : '#FFF',
										borderWidth: 1,
										borderColor: complianceStatus === 'APPROVED' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)',
									}}
								>
									<View className={`w-11 h-11 rounded-xl items-center justify-center ${complianceStatus === 'APPROVED' ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
										<Ionicons
											name={complianceStatus === 'APPROVED' ? 'shield-checkmark' : 'shield-outline'}
											size={22}
											color={complianceStatus === 'APPROVED' ? '#10B981' : '#F59E0B'}
										/>
									</View>
									<View className="flex-1">
										<Text className="text-base font-black text-secondary dark:text-off-white">
											{complianceStatus === 'APPROVED' ? 'Aprovado' :
												complianceStatus === 'PENDING' ? 'Pendente' :
													complianceStatus === 'REJECTED' ? 'Rejeitado' : 'Suspenso'}
										</Text>
										{complianceStatus !== 'APPROVED' && (
											<Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
												{complianceStatus === 'PENDING' ? 'Documentos em análise' : 'Contacte o suporte'}
											</Text>
										)}
									</View>
									{complianceStatus === 'APPROVED' && (
										<View className="px-3 py-1 rounded-lg bg-green-500/20">
											<Text className="text-xs font-black text-green-600">OK</Text>
										</View>
									)}
								</View>
							</Animated.View>
						)}

						{/* Emergency Contact */}
						<Animated.View entering={FadeInDown.duration(600).delay(350)} className="mt-5">
							<TouchableOpacity
								className="flex-row items-center gap-4 p-4 rounded-2xl"
								style={{
									backgroundColor: isDark ? '#1A1A1A' : '#FFF',
									elevation: 2,
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 2 },
									shadowOpacity: 0.05,
									shadowRadius: 8,
								}}
								onPress={() => {
									setEmergencyName(user?.emergencyContactName || '');
									setEmergencyPhone(user?.emergencyContactPhone || '');
									setShowEmergencyModal(true);
								}}
								activeOpacity={0.7}
							>
								<View className="w-11 h-11 rounded-xl items-center justify-center bg-red-500/10">
									<Ionicons name="medkit-outline" size={22} color="#ED1C24" />
								</View>
								<View className="flex-1">
									{(user?.emergencyContactName || user?.emergencyContactPhone) ? (
										<>
											{user?.emergencyContactName && (
												<Text className="text-base font-black text-secondary dark:text-off-white">{user.emergencyContactName}</Text>
											)}
											{user?.emergencyContactPhone && (
												<Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-0.5">{user.emergencyContactPhone}</Text>
											)}
										</>
									) : (
										<>
											<Text className="text-base font-black text-secondary dark:text-off-white">Adicionar Contacto de Emergência</Text>
											<Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-0.5">Quem contactar em caso de emergência</Text>
										</>
									)}
								</View>
								<Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
							</TouchableOpacity>
						</Animated.View>

						{/* Logout */}
						<Animated.View entering={FadeInDown.duration(600).delay(400)} className="mt-8 items-center">
							<TouchableOpacity className="flex-row items-center gap-2 py-3 px-6 active:opacity-60" onPress={handleLogout} activeOpacity={0.7}>
								<Ionicons name="log-out-outline" size={18} color="#ED1C24" />
								<Text className="text-sm font-black text-red-500">Sair da Conta</Text>
							</TouchableOpacity>
						</Animated.View>

						<Animated.View entering={FadeInDown.duration(600).delay(450)} className="mt-4 mb-8 items-center">
							<Text className="text-xs font-bold text-gray-400">FDA-Drivers v1.0.0</Text>
						</Animated.View>
					</View>
				)}
			</ScrollView>

			{/* Emergency Contact Modal */}
			<Modal visible={showEmergencyModal} animationType="fade" transparent onRequestClose={() => setShowEmergencyModal(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center">
					<Pressable className="absolute inset-0 bg-black/50" onPress={() => setShowEmergencyModal(false)} />
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<Animated.View entering={FadeInDown.duration(300).springify()}>
							<View className="mx-6 rounded-[32px] p-6" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }}>
								<View className="items-center mb-6">
									<View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-4">
										<Ionicons name="medkit-outline" size={32} color="#ED1C24" />
									</View>
									<Text className="text-xl font-black text-center" style={{ color: themeColors.text }}>
										Contacto de Emergência
									</Text>
								</View>
								<Input
									label="Nome"
									value={emergencyName}
									onChangeText={setEmergencyName}
									placeholder="Nome do contacto"
									leftIcon="person-outline"
								/>
								<Input
									label="Telefone"
									value={emergencyPhone}
									onChangeText={setEmergencyPhone}
									placeholder="+244 900 000 000"
									leftIcon="call-outline"
								/>
								<View className="flex-row gap-3 mt-4">
									<TouchableOpacity
										className="flex-1 py-3.5 rounded-2xl"
										style={{ backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5' }}
										onPress={() => setShowEmergencyModal(false)}
										activeOpacity={0.7}
									>
										<Text className="text-center font-bold" style={{ color: themeColors.text }}>Cancelar</Text>
									</TouchableOpacity>
									<TouchableOpacity
										className="flex-1 py-3.5 rounded-2xl"
										style={{ backgroundColor: '#ED1C24' }}
										onPress={() => {
											if (!emergencyName.trim() || !emergencyPhone.trim()) {
												Alert.alert('Atenção', 'Preenche o nome e o telefone do contacto de emergência.');
												return;
											}
											emergencyMutation.mutate();
										}}
										activeOpacity={0.7}
									>
										<Text className="text-center font-bold text-white">
											{emergencyMutation.isPending ? 'A salvar...' : 'Salvar'}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						</Animated.View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Modal>

			{/* Phone Verification Modal */}
			<Modal visible={showPhoneVerificationModal} animationType="fade" transparent onRequestClose={() => setShowPhoneVerificationModal(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center">
					<Pressable className="absolute inset-0 bg-black/50" onPress={() => setShowPhoneVerificationModal(false)} />
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<Animated.View entering={FadeInDown.duration(300).springify()}>
							<View className="mx-6 rounded-[32px] p-6" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }}>
								<View className="items-center mb-6">
									<View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
										<Ionicons name="phone-portrait-outline" size={32} color={themeColors.primary} />
									</View>
									<Text className="text-xl font-black text-center" style={{ color: themeColors.text }}>
										Verificar Telefone
									</Text>
									<Text className="text-sm text-center mt-2" style={{ color: themeColors.text + '99' }}>
										{user?.phoneNumber || '---'}
									</Text>
								</View>

								{!phoneOtpSent ? (
									<TouchableOpacity
										className="py-3.5 rounded-2xl items-center"
										style={{ backgroundColor: themeColors.primary }}
										onPress={() => sendOtpMutation.mutate()}
										activeOpacity={0.7}
									>
										<Text className="font-bold text-secondary">
											{sendOtpMutation.isPending ? 'A enviar...' : 'Enviar Código de Verificação'}
										</Text>
									</TouchableOpacity>
								) : (
									<>
										<TextInput
											className="w-full px-4 py-3.5 rounded-2xl mb-4 text-base text-center tracking-[8px] font-black"
											placeholder="0000"
											placeholderTextColor="#9CA3AF"
											keyboardType="number-pad"
											maxLength={6}
											value={phoneOtpCode}
											onChangeText={setPhoneOtpCode}
											style={{
												backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
												color: themeColors.text,
											}}
										/>
										<View className="flex-row gap-3">
											<TouchableOpacity
												className="flex-1 py-3.5 rounded-2xl"
												style={{ backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5' }}
												onPress={() => {
													setPhoneOtpSent(false);
													setPhoneOtpCode('');
												}}
												activeOpacity={0.7}
											>
												<Text className="text-center font-bold" style={{ color: themeColors.text }}>Reenviar</Text>
											</TouchableOpacity>
											<TouchableOpacity
												className="flex-1 py-3.5 rounded-2xl"
												style={{ backgroundColor: themeColors.primary }}
												onPress={() => {
													if (!phoneOtpCode.trim()) {
														Alert.alert('Atenção', 'Insere o código de verificação.');
														return;
													}
													confirmOtpMutation.mutate();
												}}
												activeOpacity={0.7}
											>
												<Text className="text-center font-bold text-secondary">
													{confirmOtpMutation.isPending ? 'A verificar...' : 'Confirmar'}
												</Text>
											</TouchableOpacity>
										</View>
									</>
								)}

								<TouchableOpacity
									className="mt-4 py-2 items-center"
									onPress={() => setShowPhoneVerificationModal(false)}
									activeOpacity={0.7}
								>
									<Text className="text-sm font-bold" style={{ color: themeColors.text + '80' }}>Cancelar</Text>
								</TouchableOpacity>
							</View>
						</Animated.View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Modal>

			<Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end">
					<Pressable className="absolute inset-0 bg-black/50" onPress={() => setShowEditModal(false)} />
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View className="bg-white dark:bg-[#121212] rounded-t-3xl p-6 pb-10">
							<View className="flex-row items-center justify-between mb-6">
								<Text className="text-2xl font-black text-gray-900 dark:text-white">Editar Perfil</Text>
								<TouchableOpacity onPress={() => setShowEditModal(false)} className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
									<Ionicons name="close" size={20} color={isDark ? '#FFF' : '#000'} />
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
