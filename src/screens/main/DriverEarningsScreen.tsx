import React from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import { usePayouts } from '../../hooks/useEarnings';

export default function DriverEarningsScreen() {
	const navigation = useNavigation();
	const { themeColors, isDark } = useThemeColors();
	const { data: driverProfile, isLoading: profileLoading, refetch: refetchProfile } = useDriverProfile();
	const { data: payoutsData, isLoading: payoutsLoading, refetch: refetchPayouts } = usePayouts();

	const isRefreshing = profileLoading || payoutsLoading;
	const onRefresh = () => {
		refetchProfile();
		refetchPayouts();
	};

	const balance = driverProfile?.availableBalance ?? 0;
	const pendingBalance = driverProfile?.pendingBalance ?? 0;
	const payouts = payoutsData?.payouts ?? [];

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.background }}>
			<View className="flex-row items-center justify-between px-5 py-3">
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
				>
					<Ionicons name="chevron-back" size={22} color={themeColors.text} />
				</TouchableOpacity>
				<Text className="text-xl font-bold tracking-tight" style={{ color: themeColors.text }}>
					Meus Ganhos
				</Text>
				<View className="w-10" />
			</View>

			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
			>
				<Animated.View entering={FadeInDown.duration(600)} className="mt-4">
					<View
						className="p-6 rounded-3xl"
						style={{
							backgroundColor: themeColors.primary,
						}}
					>
						<Text className="text-sm font-bold text-secondary/60 uppercase tracking-wider">Saldo Disponível</Text>
						<Text className="text-4xl font-black text-secondary mt-2">
							{Number(balance).toLocaleString('pt-AO')} Kz
						</Text>
						<View className="mt-4 pt-4 border-t border-secondary/20">
							<View className="flex-row justify-between">
								<Text className="text-sm font-bold text-secondary/60">Pendente</Text>
								<Text className="text-sm font-black text-secondary">
									{Number(pendingBalance).toLocaleString('pt-AO')} Kz
								</Text>
							</View>
						</View>
					</View>
				</Animated.View>

				<Animated.View entering={FadeInDown.duration(600).delay(200)} className="mt-8">
					<Text className="text-lg font-bold mb-4" style={{ color: themeColors.text }}>
						Histórico de Pagamentos
					</Text>

					{payouts.length === 0 ? (
						<View className="items-center py-12">
							<Ionicons name="wallet-outline" size={48} color={isDark ? '#404040' : '#D1D5DB'} />
							<Text className="text-base font-bold mt-4" style={{ color: themeColors.text }}>
								Nenhum pagamento ainda
							</Text>
							<Text className="text-sm mt-2 text-gray-500">
								Os pagamentos aparecerão aqui após as viagens concluídas.
							</Text>
						</View>
					) : (
						payouts.map((payout, index) => (
							<Animated.View
								key={payout.id}
								entering={FadeInRight.duration(500).delay(index * 60)}
							>
								<View
									className="flex-row items-center p-4 rounded-2xl mb-3"
									style={{
										backgroundColor: isDark ? '#1A1A1A' : '#FFF',
										elevation: 2,
										shadowColor: '#000',
										shadowOffset: { width: 0, height: 2 },
										shadowOpacity: 0.05,
										shadowRadius: 8,
									}}
								>
									<View className="w-10 h-10 rounded-full items-center justify-center bg-green-500/20">
										<Ionicons name="cash" size={20} color="#10B981" />
									</View>
									<View className="flex-1 ml-3">
										<Text className="text-base font-bold" style={{ color: themeColors.text }}>
											{Number(payout.amount).toLocaleString('pt-AO')} Kz
										</Text>
										<Text className="text-xs font-medium text-gray-500 mt-0.5">
											{payout.processedAt
												? new Date(payout.processedAt).toLocaleDateString('pt-AO')
												: 'Pendente'}
											{payout.reference ? ` • ${payout.reference}` : ''}
										</Text>
									</View>
									{payout.processedAt ? (
										<View className="px-2 py-1 rounded-lg bg-green-500/20">
											<Text className="text-xs font-bold text-green-600">Pago</Text>
										</View>
									) : (
										<View className="px-2 py-1 rounded-lg bg-yellow-500/20">
											<Text className="text-xs font-bold text-yellow-600">Pendente</Text>
										</View>
									)}
								</View>
							</Animated.View>
						))
					)}
				</Animated.View>

				<View className="h-10" />
			</ScrollView>
		</SafeAreaView>
	);
}
