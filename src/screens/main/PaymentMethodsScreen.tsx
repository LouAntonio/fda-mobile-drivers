import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
	FadeInDown,
	FadeInRight,
	FadeInUp,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';

const INITIAL_METHODS: Array<{
	id: string;
	type: string;
	label: string;
	icon: 'cash-outline' | 'phone';
	details: string;
	isDefault: boolean;
	isRemovable: boolean;
}> = [
	{
		id: 'cash',
		type: 'cash',
		label: 'Dinheiro',
		icon: 'cash-outline' as const,
		details: 'Pagamento com Dinheiro vivo',
		isDefault: true,
		isRemovable: false,
	},
];

export default function PaymentMethodsScreen() {
	const navigation = useNavigation();
	const { themeColors, isDark } = useThemeColors();
	const hasMulticaixa = false;

	return (
		<SafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.background }}
		>
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 pt-2 pb-4">
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className="w-11 h-11 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
					activeOpacity={0.7}
				>
					<Ionicons
						name="chevron-back"
						size={24}
						color={themeColors.text}
					/>
				</TouchableOpacity>
				<Text
					className="text-xl font-bold tracking-tight"
					style={{ color: themeColors.text }}
				>
					Métodos de Pagamento
				</Text>
				<View className="w-11 h-11 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
					<Ionicons
						name="wallet-outline"
						size={22}
						color={themeColors.text}
					/>
				</View>
			</View>

			<ScrollView
				contentContainerClassName="px-5 pb-10 pt-4"
				showsVerticalScrollIndicator={false}
			>
				{/* Section Title */}
				<Animated.View
					entering={FadeInDown.duration(400)}
					className="mb-6"
				>
					<Text
						className="text-sm font-bold uppercase tracking-widest"
						style={{ color: themeColors.secondary }}
					>
						Métodos de Pagamento
					</Text>
				</Animated.View>

				{/* Cards */}
				<View className="gap-5">
					{INITIAL_METHODS.map((method, index) => (
						<Animated.View
							key={method.id}
							entering={FadeInRight.duration(500).delay(
								index * 100,
							)}
						>
							{method.type === 'multicaixa' ? (
								/* Premium Multicaixa Express Card */
								<View
									className="relative w-full rounded-[32px] overflow-hidden shadow-2xl"
									// eslint-disable-next-line react-native/no-inline-styles
									style={{
										backgroundColor: '#1A1C1E',
										elevation: 8,
									}}
								>
									{/* Decorative shapes */}
									<View className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
									<View className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-white/5" />
									<View
										className="absolute right-10 bottom-5 w-20 h-20 rounded-full"
										// eslint-disable-next-line react-native/no-inline-styles
										style={{
											backgroundColor:
												themeColors.primary,
											opacity: 0.1,
										}}
									/>

									<View className="p-7 h-56 justify-between">
										<View className="flex-row justify-between items-start">
											<View className="w-14 h-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
												<MaterialCommunityIcons
													name="bank"
													size={32}
													color={themeColors.primary}
												/>
											</View>
											<View className="flex-row items-center">
												{method.isRemovable && (
													<TouchableOpacity
														onPress={() => {}}
														className="w-11 h-11 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20"
														activeOpacity={0.7}
													>
														<Ionicons
															name="trash-outline"
															size={20}
															color="#EF4444"
														/>
													</TouchableOpacity>
												)}
											</View>
										</View>

										<View>
											<Text className="text-white/40 text-[10px] uppercase tracking-[2px] font-black mb-1">
												{method.label}
											</Text>
											<Text className="text-white text-2xl font-mono tracking-[4px] mb-6">
												{method.details}
											</Text>

											<View className="flex-row justify-between items-center">
												<View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full" />
												<View className="opacity-40">
													<MaterialCommunityIcons
														name="check-decagram"
														size={24}
														color={
															themeColors.primary
														}
													/>
												</View>
											</View>
										</View>
									</View>
								</View>
							) : (
								/* Premium Cash Card */
								<View
									className="relative w-full rounded-[32px] overflow-hidden shadow-2xl"
									// eslint-disable-next-line react-native/no-inline-styles
									style={{
										backgroundColor: isDark
											? '#0D1F17'
											: '#F0F9F4',
										elevation: 4,
									}}
								>
									{/* Decorative background pattern */}
									<View className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-green-500/5" />
									<View className="absolute left-10 top-5 w-16 h-16 rounded-full bg-green-500/5" />

									<View className="p-7 h-52 justify-between">
										<View className="flex-row justify-between items-start">
											<View className="w-14 h-14 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
												<MaterialCommunityIcons
													name="cash-multiple"
													size={32}
													color="#22C55E"
												/>
											</View>
											{method.isDefault && (
												<View className="bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
													<Text className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-wider">
														Padrão
													</Text>
												</View>
											)}
										</View>

										<View>
											<Text
												className={`${isDark ? 'text-white/40' : 'text-gray-500'} text-[10px] uppercase tracking-[2px] font-black mb-1`}
											>
												{method.label}
											</Text>
											<Text
												className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-bold tracking-tight mb-4`}
											>
												Pagamento em Cash
											</Text>

											<View className="flex-row items-center gap-2">
												<Ionicons
													name="information-circle-outline"
													size={16}
													color={
														isDark
															? '#22C55E'
															: '#166534'
													}
												/>
												<Text
													className={`${isDark ? 'text-green-400/80' : 'text-green-700/80'} font-medium text-xs`}
												>
													{method.details}
												</Text>
											</View>
										</View>
									</View>
								</View>
							)}
						</Animated.View>
					))}
				</View>

				{/* Express Coming Soon */}
				{!hasMulticaixa && (
					<Animated.View
						entering={FadeInUp.duration(600).delay(200)}
						className="mt-8"
					>
						<View
							className={`p-6 rounded-3xl border ${isDark ? 'border-primary/20 bg-primary/5' : 'border-primary/30 bg-primary/5'}`}
						>
							<View className="flex-row items-center gap-4">
								<View
									className="w-14 h-14 rounded-2xl items-center justify-center"
									style={{
										backgroundColor: themeColors.primary,
									}}
								>
									<Ionicons
										name="time-outline"
										size={30}
										color="#231F20"
									/>
								</View>
								<View className="flex-1">
									<Text
										className="text-base font-bold"
										style={{ color: themeColors.text }}
									>
										Multicaixa Express
									</Text>
									<Text
										className="text-sm font-medium mt-1"
										style={{ color: themeColors.primary }}
									>
										Disponível em breve
									</Text>
									<Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										Estamos a trabalhar para trazer esta
										funcionalidade em breve.
									</Text>
								</View>
							</View>
						</View>
					</Animated.View>
				)}

				<Animated.View
					entering={FadeInUp.duration(600).delay(400)}
					className="mt-10 items-center px-4"
				>
					<MaterialCommunityIcons
						name="shield-check"
						size={32}
						color={themeColors.secondary}
						className="mb-2"
					/>
					<Text
						className="text-center text-sm"
						style={{ color: themeColors.secondary }}
					>
						Os seus dados estão protegidos. Não partilhamos as suas
						informações.
					</Text>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
}
