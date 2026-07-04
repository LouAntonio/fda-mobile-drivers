import React, { useState, useMemo } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Modal,
	Pressable,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import DateTimePicker, {
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTrips } from '../../hooks/useTrips';
import type { TripStatus, ServiceType } from '../../types/api';
import { TripCardSkeleton } from '../../components/skeletons/TripCardSkeleton';

const STATUS_OPTIONS = [
	{ key: 'all', label: 'Todos' },
	{ key: 'COMPLETED' as const, label: 'Concluídos' },
	{ key: 'CANCELLED' as const, label: 'Cancelados' },
];

const TYPE_OPTIONS = [
	{ key: 'all', label: 'Ambos' },
	{ key: 'RIDE' as const, label: 'Corrida' },
	{ key: 'DELIVERY' as const, label: 'Entrega' },
];

type StatusKey = (typeof STATUS_OPTIONS)[number]['key'];
type TypeKey = (typeof TYPE_OPTIONS)[number]['key'];

const STATUS_COLORS: Record<string, string> = {
	COMPLETED: '#10B981',
	CANCELLED: '#ED1C24',
	REQUESTED: '#F59E0B',
	ACCEPTED: '#3B82F6',
	PICKUP_IN_PROGRESS: '#3B82F6',
	STARTED: '#3B82F6',
};

function formatDate(iso: string) {
	const d = new Date(iso);
	return d.toLocaleDateString('pt-AO', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}

function formatTime(iso: string) {
	const d = new Date(iso);
	return d.toLocaleTimeString('pt-AO', {
		hour: '2-digit',
		minute: '2-digit',
	});
}

function formatPrice(price: number): string {
	return new Intl.NumberFormat('pt-AO', {
		style: 'currency',
		currency: 'AOA',
		minimumFractionDigits: 0,
	})
		.format(price)
		.replace('AOA', 'Kz')
		.trim();
}

export default function HistoryScreen() {
	const navigation = useNavigation<any>();
	const { themeColors, isDark } = useThemeColors();

	const [statusFilter, setStatusFilter] = useState<StatusKey>('all');
	const [typeFilter, setTypeFilter] = useState<TypeKey>('all');
	const [periodFilter, setPeriodFilter] = useState<
		'all' | 'today' | 'week' | 'month' | 'custom'
	>('all');
	const [customStart, setCustomStart] = useState<Date | null>(null);
	const [customEnd, setCustomEnd] = useState<Date | null>(null);
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

	const apiFilters = useMemo(() => {
		const filters: Record<string, unknown> = { limit: 50 };
		if (statusFilter !== 'all') filters.status = statusFilter;
		if (typeFilter !== 'all') filters.serviceType = typeFilter;
		if (periodFilter === 'today') {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			filters.dateFrom = today.toISOString();
		} else if (periodFilter === 'week') {
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);
			filters.dateFrom = weekAgo.toISOString();
		} else if (periodFilter === 'month') {
			const monthAgo = new Date();
			monthAgo.setMonth(monthAgo.getMonth() - 1);
			filters.dateFrom = monthAgo.toISOString();
		} else if (periodFilter === 'custom') {
			if (customStart) filters.dateFrom = customStart.toISOString();
			if (customEnd) {
				const end = new Date(customEnd);
				end.setHours(23, 59, 59, 999);
				filters.dateTo = end.toISOString();
			}
		}
		return filters;
	}, [statusFilter, typeFilter, periodFilter, customStart, customEnd]);

	const {
		data,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		refetch,
		isRefetching,
	} = useTrips(apiFilters);

	const allTrips = useMemo(
		() => data?.pages.flatMap((p) => p.trips) ?? [],
		[data],
	);

	const getStatusColor = (status: TripStatus) =>
		STATUS_COLORS[status] || '#6B7280';
	const getStatusLabel = (status: TripStatus) => {
		if (status === 'COMPLETED') return 'Concluído';
		if (status === 'CANCELLED') return 'Cancelado';
		if (status === 'REQUESTED') return 'Solicitada';
		if (status === 'ACCEPTED') return 'Aceite';
		if (status === 'STARTED') return 'Em Andamento';
		if (status === 'PICKUP_IN_PROGRESS') return 'Em Andamento';
		return status;
	};

	return (
		<SafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.background }}
		>
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 py-3">
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
					activeOpacity={0.7}
				>
					<Ionicons
						name="chevron-back"
						size={22}
						color={themeColors.text}
					/>
				</TouchableOpacity>
				<Text
					className="text-xl font-bold tracking-tight"
					style={{ color: themeColors.text }}
				>
					Histórico
				</Text>
				<TouchableOpacity
					onPress={() => setIsFilterModalOpen(true)}
					className="w-10 h-10 items-center justify-center rounded-full bg-primary/10"
					activeOpacity={0.7}
				>
					<Ionicons
						name="options-outline"
						size={22}
						color={themeColors.primary}
					/>
				</TouchableOpacity>
			</View>

			{/* Horizontal filter chips */}
			<View className="px-5 pb-3 gap-2">
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="gap-2"
					contentContainerClassName="gap-2"
				>
					{STATUS_OPTIONS.map((opt) => {
						const active = statusFilter === opt.key;
						return (
							<TouchableOpacity
								key={opt.key}
								className={`px-4 py-2 rounded-full border ${
									active
										? 'border-primary bg-primary'
										: isDark
											? 'border-gray-700 bg-[#1A1A1A]'
											: 'border-gray-200 bg-white'
								}`}
								onPress={() => setStatusFilter(opt.key)}
								activeOpacity={0.7}
							>
								<Text
									className={`text-xs font-bold ${
										active
											? 'text-secondary'
											: isDark
												? 'text-gray-400'
												: 'text-gray-500'
									}`}
								>
									{opt.label}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerClassName="gap-2"
				>
					{TYPE_OPTIONS.map((opt) => {
						const active = typeFilter === opt.key;
						return (
							<TouchableOpacity
								key={opt.key}
								className={`px-4 py-2 rounded-full border ${
									active
										? 'border-primary bg-primary'
										: isDark
											? 'border-gray-700 bg-[#1A1A1A]'
											: 'border-gray-200 bg-white'
								}`}
								onPress={() => setTypeFilter(opt.key)}
								activeOpacity={0.7}
							>
								<Text
									className={`text-xs font-bold ${
										active
											? 'text-secondary'
											: isDark
												? 'text-gray-400'
												: 'text-gray-500'
									}`}
								>
									{opt.label}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</View>

			{/* Trip list */}
			<ScrollView
				contentContainerClassName="px-5 pb-10"
				showsVerticalScrollIndicator={false}
				onMomentumScrollEnd={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={refetch}
					/>
				}
			>
				{isLoading ? (
					<View className="pt-4">
						<TripCardSkeleton />
						<TripCardSkeleton />
						<TripCardSkeleton />
						<TripCardSkeleton />
						<TripCardSkeleton />
					</View>
				) : allTrips.length === 0 ? (
					<Animated.View
						entering={FadeInDown.duration(600)}
						className="items-center pt-20"
					>
						<Ionicons
							name="document-text-outline"
							size={64}
							color={isDark ? '#404040' : '#D1D5DB'}
						/>
						<Text
							className="text-lg font-bold mt-4"
							style={{ color: themeColors.text }}
						>
							Nenhum resultado
						</Text>
						<Text className="text-sm font-medium mt-2 text-gray-500 dark:text-gray-400">
							Nenhuma viagem encontrada para este filtro.
						</Text>
					</Animated.View>
				) : (
					allTrips.map((item, index) => {
						const statusColor = getStatusColor(item.status);
						return (
							<Animated.View
								key={item.id}
								entering={FadeInRight.duration(500).delay(
									index * 60,
								)}
							>
								<TouchableOpacity
									className="flex-row bg-white dark:bg-soft-black rounded-2xl mb-3 overflow-hidden active:opacity-70"
									style={{
										elevation: 2,
										shadowColor: '#000',
										shadowOffset: {
											width: 0,
											height: 2,
										},
										shadowOpacity: 0.05,
										shadowRadius: 8,
										borderWidth: 1,
										borderColor: 'rgba(0,0,0,0.04)',
									}}
									activeOpacity={0.7}
									onPress={() =>
										navigation.navigate('TripDetail', {
											tripId: item.id,
										})
									}
								>
									{/* Left accent */}
									<View
										style={{
											width: 4,
											backgroundColor: statusColor,
										}}
									/>

									<View className="flex-1 p-4">
										{/* Top row: service type + status + price */}
										<View className="flex-row items-center justify-between mb-2">
											<View className="flex-row items-center gap-2">
												<View className="flex-row items-center gap-1">
													<Ionicons
														name={
															item.serviceType ===
															'RIDE'
																? 'car-outline'
																: 'cube-outline'
														}
														size={14}
														color={statusColor}
													/>
													<Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
														{item.serviceType ===
														'RIDE'
															? 'Corrida'
															: 'Entrega'}
													</Text>
												</View>
												<View
													className="w-1 h-1 rounded-full"
													style={{
														backgroundColor:
															isDark
																? '#404040'
																: '#D1D5DB',
													}}
												/>
												<Text
													className="text-xs font-bold"
													style={{
														color: statusColor,
													}}
												>
													{getStatusLabel(
														item.status,
													)}
												</Text>
											</View>
											<Text className="text-base font-extrabold text-secondary dark:text-off-white">
												{formatPrice(
													Number(item.totalPrice),
												)}
											</Text>
										</View>

										{/* Route */}
										<View className="flex-row items-center mb-1.5">
											<View className="w-4 items-center mr-2">
												<View className="w-2 h-2 rounded-full bg-blue-500" />
												<View className="w-0.5 h-4 bg-gray-200 dark:bg-gray-700 my-0.5 rounded-full" />
												<View
													className={`w-2 h-2 rounded-full ${
														item.status ===
														'COMPLETED'
															? 'bg-primary'
															: 'bg-red-500'
													}`}
												/>
											</View>
											<View className="flex-1 gap-1">
												<Text
													className="text-sm font-bold text-secondary dark:text-off-white"
													numberOfLines={1}
												>
													{item.pickupAddress}
												</Text>
												<Text
													className="text-sm font-bold text-secondary dark:text-off-white"
													numberOfLines={1}
												>
													{item.dropoffAddress}
												</Text>
											</View>
										</View>

										{/* Bottom row: driver + date */}
										<View className="flex-row items-center justify-between mt-1.5">
											<View className="flex-row items-center gap-2">
												{item.driver && (
													<>
														<View className="flex-row items-center gap-1">
															<Ionicons
																name="person-outline"
																size={12}
																color="#9CA3AF"
															/>
															<Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
																{item.driver
																	.user
																	?.name || ''}
															</Text>
														</View>
														<View
															className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"
														/>
													</>
												)}
												<Text className="text-xs font-medium text-gray-400 dark:text-gray-500">
													{formatDate(
														item.requestedAt,
													)}{' '}
													•{' '}
													{formatTime(
														item.requestedAt,
													)}
												</Text>
											</View>
										</View>
									</View>
								</TouchableOpacity>
							</Animated.View>
						);
					})
				)}

				{isFetchingNextPage && (
					<View className="py-4 items-center">
						<ActivityIndicator color={themeColors.primary} />
					</View>
				)}
			</ScrollView>

			{/* Filter modal — date only */}
			<Modal
				visible={isFilterModalOpen}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setIsFilterModalOpen(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1 justify-end"
				>
					<Pressable
						className="absolute inset-0 bg-black/50"
						onPress={() => setIsFilterModalOpen(false)}
					/>
					<View
						className={`rounded-t-3xl pt-6 pb-10 px-6 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}
						style={{ minHeight: '50%' }}
					>
						<View className="flex-row items-center justify-between mb-6">
							<Text
								className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								Filtrar por Data
							</Text>
							<TouchableOpacity
								onPress={() => setIsFilterModalOpen(false)}
								className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"
							>
								<Ionicons
									name="close"
									size={20}
									color={isDark ? '#FFF' : '#000'}
								/>
							</TouchableOpacity>
						</View>

						<ScrollView
							showsVerticalScrollIndicator={false}
							contentContainerClassName="pb-6"
						>
							<Text
								className={`text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
							>
								Período
							</Text>
							<View className="flex-row flex-wrap gap-2 mb-6">
								{(
									[
										'all',
										'today',
										'week',
										'month',
										'custom',
									] as const
								).map((f) => {
									const isActive = periodFilter === f;
									return (
										<TouchableOpacity
											key={f}
											className={`px-4 py-2 rounded-full border ${isActive ? 'border-primary bg-primary' : isDark ? 'border-gray-700 bg-[#1A1A1A]' : 'border-gray-200 bg-white'}`}
											onPress={() =>
												setPeriodFilter(f)
											}
											activeOpacity={0.7}
										>
											<Text
												className={`text-sm font-semibold ${isActive ? 'text-soft-black' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
											>
												{f === 'all'
													? 'Qualquer'
													: f === 'today'
														? 'Hoje'
														: f === 'week'
															? 'Esta semana'
															: f === 'month'
																? 'Este mês'
																: 'Personalizado'}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>

							{periodFilter === 'custom' && (
								<Animated.View
									entering={FadeInDown.duration(300)}
								>
									<View className="flex-row gap-4">
										<View className="flex-1">
											<Text
												className={`text-xs mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
											>
												Data Inicial
											</Text>
											<TouchableOpacity
												onPress={() =>
													setShowStartPicker(true)
												}
												className={`px-4 py-3.5 flex-row items-center justify-between rounded-xl border ${isDark ? 'border-gray-800 bg-[#1A1A1A]' : 'border-gray-200 bg-gray-50'}`}
												activeOpacity={0.7}
											>
												<Text
													className={
														customStart
															? isDark
																? 'text-white'
																: 'text-black'
															: isDark
																? 'text-gray-500'
																: 'text-gray-400'
													}
												>
													{customStart
														? customStart.toLocaleDateString(
																'pt-AO',
															)
														: 'Selecionar...'}
												</Text>
												<Ionicons
													name="calendar-outline"
													size={16}
													color={
														isDark
															? '#888'
															: '#A0A0A0'
													}
												/>
											</TouchableOpacity>
											{showStartPicker && (
												<DateTimePicker
													value={
														customStart ??
														new Date()
													}
													mode="date"
													display="default"
													onChange={(
														event: DateTimePickerEvent,
														selectedDate?: Date,
													) => {
														setShowStartPicker(
															Platform.OS ===
																'ios',
														);
														if (selectedDate)
															setCustomStart(
																selectedDate,
															);
													}}
												/>
											)}
										</View>
										<View className="flex-1">
											<Text
												className={`text-xs mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
											>
												Data Final
											</Text>
											<TouchableOpacity
												onPress={() =>
													setShowEndPicker(true)
												}
												className={`px-4 py-3.5 flex-row items-center justify-between rounded-xl border ${isDark ? 'border-gray-800 bg-[#1A1A1A]' : 'border-gray-200 bg-gray-50'}`}
												activeOpacity={0.7}
											>
												<Text
													className={
														customEnd
															? isDark
																? 'text-white'
																: 'text-black'
															: isDark
																? 'text-gray-500'
																: 'text-gray-400'
													}
												>
													{customEnd
														? customEnd.toLocaleDateString(
																'pt-AO',
															)
														: 'Selecionar...'}
												</Text>
												<Ionicons
													name="calendar-outline"
													size={16}
													color={
														isDark
															? '#888'
															: '#A0A0A0'
													}
												/>
											</TouchableOpacity>
											{showEndPicker && (
												<DateTimePicker
													value={
														customEnd ?? new Date()
													}
													mode="date"
													display="default"
													onChange={(
														event: DateTimePickerEvent,
														selectedDate?: Date,
													) => {
														setShowEndPicker(
															Platform.OS ===
																'ios',
														);
														if (selectedDate)
															setCustomEnd(
																selectedDate,
															);
													}}
												/>
											)}
										</View>
									</View>
								</Animated.View>
							)}
						</ScrollView>

						<View className="flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
							<TouchableOpacity
								className="flex-1 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 items-center justify-center"
								onPress={() => {
									setPeriodFilter('all');
									setCustomStart(null);
									setCustomEnd(null);
								}}
							>
								<Text
									className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
								>
									Limpar
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className="flex-1 py-3.5 rounded-xl bg-primary items-center justify-center"
								onPress={() => setIsFilterModalOpen(false)}
							>
								<Text className="font-bold text-soft-black">
									Aplicar
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}
