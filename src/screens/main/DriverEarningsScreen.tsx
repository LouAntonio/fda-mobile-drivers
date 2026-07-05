import React, { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	RefreshControl,
	Alert,
	TextInput,
	Modal,
	Pressable,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
	TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import { usePayouts } from '../../hooks/useEarnings';
import { requestPayout } from '../../api/earnings';

export default function DriverEarningsScreen() {
	const navigation = useNavigation();
	const { themeColors, isDark } = useThemeColors();
	const { data: driverProfile, isLoading: profileLoading, refetch: refetchProfile } = useDriverProfile();
	const { data: payoutsData, isLoading: payoutsLoading, refetch: refetchPayouts } = usePayouts();

	const [showModal, setShowModal] = useState(false);
	const [payoutAmount, setPayoutAmount] = useState('');

	const isRefreshing = profileLoading || payoutsLoading;
	const onRefresh = () => { refetchProfile(); refetchPayouts(); };

	const balance = driverProfile?.availableBalance ?? 0;
	const pendingBalance = driverProfile?.pendingBalance ?? 0;
	const payouts = payoutsData?.payouts ?? [];

	const payoutMutation = useMutation({
		mutationFn: (amount: number) => requestPayout(amount),
		onSuccess: () => {
			setShowModal(false);
			setPayoutAmount('');
			refetchProfile();
			refetchPayouts();
			Alert.alert('Sucesso', 'Saque solicitado com sucesso! O pagamento será processado em dinheiro.');
		},
		onError: (err: any) => {
			const msg = err?.response?.data?.msg || err?.response?.data?.message || 'Erro ao solicitar saque. Tenta novamente.';
			Alert.alert('Erro', msg);
		},
	});

	const handleOpenModal = () => {
		setPayoutAmount('');
		setShowModal(true);
	};

	const handleConfirmPayout = () => {
		const amount = Number(payoutAmount);
		if (!payoutAmount.trim() || isNaN(amount) || amount < 1) {
			Alert.alert('Atenção', 'Insere um valor válido.');
			return;
		}
		if (amount > Number(balance)) {
			Alert.alert('Atenção', 'O valor não pode ser superior ao saldo disponível.');
			return;
		}
		payoutMutation.mutate(amount);
	};

	return (
		<SafeAreaView className="flex-1 bg-off-white dark:bg-[#090909]">
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 py-3">
				<TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
					<Ionicons name="chevron-back" size={22} color={themeColors.text} />
				</TouchableOpacity>
				<Text className="text-lg font-black text-secondary dark:text-off-white">Meus Ganhos</Text>
				<View className="w-10" />
			</View>

			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
			>
				{/* Saldo Hero */}
				<Animated.View entering={FadeInDown.duration(600)} className="mt-4">
					<View className="p-6 rounded-3xl" style={{ backgroundColor: themeColors.primary }}>
						<Text className="text-xs font-black text-secondary/60 uppercase tracking-widest">Saldo Disponível</Text>
						<Text className="text-4xl font-black text-secondary mt-2 tracking-tight">
							{Number(balance).toLocaleString('pt-AO')} Kz
						</Text>
						<View className="mt-4 pt-4 border-t border-secondary/15">
							<View className="flex-row justify-between">
								<Text className="text-sm font-black text-secondary/60">Pendente</Text>
								<Text className="text-sm font-black text-secondary">
									{Number(pendingBalance).toLocaleString('pt-AO')} Kz
								</Text>
							</View>
						</View>
					</View>
				</Animated.View>

				{/* Withdraw & Stats Cards */}
				<Animated.View entering={FadeInDown.duration(600).delay(100)} className="flex-row gap-3 mt-4">
					<View className="flex-1 p-4 rounded-2xl items-center" style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
						<Ionicons name="trending-up" size={20} color="#10B981" />
						<Text className="text-lg font-black text-secondary dark:text-off-white mt-2">
							{Number(balance).toLocaleString('pt-AO')} Kz
						</Text>
						<Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">Disponível</Text>
					</View>
					<View className="flex-1 p-4 rounded-2xl items-center" style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
						<Ionicons name="time-outline" size={20} color="#F59E0B" />
						<Text className="text-lg font-black text-secondary dark:text-off-white mt-2">
							{Number(pendingBalance).toLocaleString('pt-AO')} Kz
						</Text>
						<Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">Pendente</Text>
					</View>
				</Animated.View>

				<TouchableOpacity
					className="mt-4 py-4 rounded-2xl items-center bg-primary active:opacity-70"
					style={{ elevation: 4, shadowColor: themeColors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 }}
					onPress={handleOpenModal}
				>
					<View className="flex-row items-center gap-2">
						<Ionicons name="arrow-down-outline" size={18} color="#231F20" />
						<Text className="text-base font-black text-secondary">Solicitar Saque</Text>
					</View>
				</TouchableOpacity>

				{/* Payout History */}
				<Animated.View entering={FadeInDown.duration(600).delay(200)} className="mt-8">
					<Text className="text-lg font-black text-secondary dark:text-off-white mb-4">Histórico de Pagamentos</Text>

					{payouts.length === 0 ? (
						<View className="items-center py-12">
							<Ionicons name="wallet-outline" size={48} color={isDark ? '#404040' : '#D1D5DB'} />
							<Text className="text-base font-black text-secondary dark:text-off-white mt-4">Nenhum pagamento ainda</Text>
							<Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 text-center">
								Os pagamentos aparecerão aqui após as viagens concluídas.
							</Text>
						</View>
					) : (
						payouts.map((payout, index) => (
							<Animated.View key={payout.id} entering={FadeInRight.duration(500).delay(index * 60)}>
								<View
									className="flex-row items-center p-4 rounded-2xl mb-3"
									style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
								>
									<View className="w-11 h-11 rounded-2xl items-center justify-center bg-green-500/20">
										<Ionicons name="cash" size={22} color="#10B981" />
									</View>
									<View className="flex-1 ml-3">
										<Text className="text-base font-black text-secondary dark:text-off-white">
											{Number(payout.amount).toLocaleString('pt-AO')} Kz
										</Text>
										<Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
											{payout.processedAt
												? new Date(payout.processedAt).toLocaleDateString('pt-AO')
												: 'Pendente'}
											{payout.reference ? ` • ${payout.reference}` : ''}
										</Text>
									</View>
									<View className={`px-3 py-1.5 rounded-lg ${payout.processedAt ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
										<Text className={`text-xs font-black ${payout.processedAt ? 'text-green-600' : 'text-yellow-600'}`}>
											{payout.processedAt ? 'Pago' : 'Pendente'}
										</Text>
									</View>
								</View>
							</Animated.View>
						))
					)}
				</Animated.View>

				<View className="h-10" />
			</ScrollView>

			{/* Payout Modal */}
			<Modal
				visible={showModal}
				animationType="fade"
				transparent
				onRequestClose={() => setShowModal(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1 justify-center"
				>
					<Pressable
						className="absolute inset-0 bg-black/60"
						onPress={() => setShowModal(false)}
					/>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<Animated.View entering={FadeInDown.duration(300).springify()}>
							<View
								className="mx-6 rounded-[32px] p-6"
								style={{
									backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
								}}
							>
								<View className="items-center mb-6">
									<View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
										<Ionicons name="arrow-down-outline" size={32} color={themeColors.primary} />
									</View>
									<Text
										className="text-xl font-black text-center"
										style={{ color: themeColors.text }}
									>
										Solicitar Saque
									</Text>
									<Text
										className="text-sm text-center mt-2"
										style={{ color: themeColors.text + '99' }}
									>
										O pagamento será processado em dinheiro. O valor será descontado do teu saldo disponível.
									</Text>
								</View>

								<View className="flex-row items-center bg-gray-100 dark:bg-[#2C2C2E] rounded-2xl px-4 mb-1">
									<Text className="text-lg font-black text-gray-400 mr-2">Kz</Text>
									<TextInput
										className="flex-1 py-4 text-lg font-black"
										placeholder="0"
										placeholderTextColor="#9CA3AF"
										keyboardType="numeric"
										value={payoutAmount}
										onChangeText={setPayoutAmount}
										style={{ color: themeColors.text }}
									/>
								</View>
								<Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 ml-1">
									Saldo disponível: {Number(balance).toLocaleString('pt-AO')} Kz
								</Text>

								<View className="flex-row gap-3">
									<TouchableOpacity
										className="flex-1 py-3.5 rounded-2xl"
										style={{
											backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
										}}
										onPress={() => {
											setShowModal(false);
											setPayoutAmount('');
										}}
										activeOpacity={0.7}
									>
										<Text
											className="text-center font-bold"
											style={{ color: themeColors.text }}
										>
											Cancelar
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										className="flex-1 py-3.5 rounded-2xl"
										style={{ backgroundColor: themeColors.primary }}
										onPress={handleConfirmPayout}
										activeOpacity={0.7}
									>
										<Text className="text-center font-bold text-secondary">
											{payoutMutation.isPending ? 'A processar...' : 'Confirmar Saque'}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						</Animated.View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}
