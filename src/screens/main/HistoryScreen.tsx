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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTrips } from '../../hooks/useTrips';
import type { TripStatus } from '../../types/api';

const STATUS_OPTIONS = [
	{ key: 'all', label: 'Todos' },
	{ key: 'COMPLETED' as const, label: 'Concluídos' },
	{ key: 'CANCELLED' as const, label: 'Cancelados' },
];

type StatusKey = (typeof STATUS_OPTIONS)[number]['key'];

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
	return d.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
	const d = new Date(iso);
	return d.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
}

function formatPrice(price: number): string {
	return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 })
		.format(price).replace('AOA', 'Kz').trim();
}

export default function HistoryScreen() {
	const navigation = useNavigation<any>();
	const { themeColors, isDark } = useThemeColors();

	const [statusFilter, setStatusFilter] = useState<StatusKey>('all');
	const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
	const [customStart, setCustomStart] = useState<Date | null>(null);
	const [customEnd, setCustomEnd] = useState<Date | null>(null);
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

	const apiFilters = useMemo(() => {
		const filters: Record<string, unknown> = { limit: 50 };
		if (statusFilter !== 'all') filters.status = statusFilter;
		if (periodFilter === 'today') {
			const today = new Date(); today.setHours(0, 0, 0, 0);
			filters.dateFrom = today.toISOString();
		} else if (periodFilter === 'week') {
			const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
			filters.dateFrom = weekAgo.toISOString();
		} else if (periodFilter === 'month') {
			const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
			filters.dateFrom = monthAgo.toISOString();
		} else if (periodFilter === 'custom') {
			if (customStart) filters.dateFrom = customStart.toISOString();
			if (customEnd) {
				const end = new Date(customEnd); end.setHours(23, 59, 59, 999);
				filters.dateTo = end.toISOString();
			}
		}
		return filters;
	}, [statusFilter, periodFilter, customStart, customEnd]);

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } = useTrips(apiFilters);

	const allTrips = useMemo(() => data?.pages.flatMap((p) => p.trips) ?? [], [data]);

	const getStatusColor = (status: TripStatus) => STATUS_COLORS[status] || '#6B7280';
	const getStatusLabel = (status: TripStatus) => {
		const map: Record<string, string> = {
			COMPLETED: 'Concluído', CANCELLED: 'Cancelado', REQUESTED: 'Solicitada',
			ACCEPTED: 'Aceite', STARTED: 'Em Andamento', PICKUP_IN_PROGRESS: 'Em Andamento',
		};
		return map[status] || status;
	};

	return (
		<SafeAreaView className="flex-1 bg-off-white dark:bg-[#090909]">
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 py-3">
				<TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10" activeOpacity={0.7}>
					<Ionicons name="chevron-back" size={22} color={themeColors.text} />
				</TouchableOpacity>
				<Text className="text-lg font-black text-secondary dark:text-off-white">Histórico</Text>
				<TouchableOpacity onPress={() => setIsFilterModalOpen(true)} className="w-10 h-10 items-center justify-center rounded-full bg-primary/10" activeOpacity={0.7}>
					<Ionicons name="options-outline" size={22} color={themeColors.primary} />
				</TouchableOpacity>
			</View>

			{/* Status Tabs */}
			<View className="px-5 pb-4">
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
					{STATUS_OPTIONS.map((opt) => {
						const active = statusFilter === opt.key;
						return (
							<TouchableOpacity
								key={opt.key}
								className={`px-5 py-2.5 rounded-full ${active ? 'bg-primary' : isDark ? 'bg-[#1A1A1A] border border-gray-800' : 'bg-white border border-gray-200'}`}
								onPress={() => setStatusFilter(opt.key)}
								activeOpacity={0.7}
							>
								<Text className={`text-xs font-black ${active ? 'text-secondary' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
									{opt.label}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</View>

			{/* Trip List */}
			<ScrollView
				className="flex-1 px-5"
				contentContainerStyle={{ paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				onMomentumScrollEnd={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
				refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
			>
				{isLoading ? (
					<View className="gap-3 pt-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<View key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-[#1A1A1A]" />
						))}
					</View>
				) : allTrips.length === 0 ? (
					<Animated.View entering={FadeInDown.duration(600)} className="items-center pt-20">
						<Ionicons name="document-text-outline" size={56} color={isDark ? '#404040' : '#D1D5DB'} />
						<Text className="text-lg font-black text-secondary dark:text-off-white mt-4">Nenhum resultado</Text>
						<Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">Nenhuma viagem encontrada para este filtro.</Text>
					</Animated.View>
				) : (
					allTrips.map((item, index) => {
						const statusColor = getStatusColor(item.status);
						return (
							<Animated.View key={item.id} entering={FadeInRight.duration(500).delay(index * 60)}>
								<TouchableOpacity
									className="rounded-2xl mb-3 overflow-hidden active:opacity-70"
									style={{ backgroundColor: isDark ? '#1A1A1A' : '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
									activeOpacity={0.7}
									onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
								>
									{/* Top: type + status + price */}
									<View className="flex-row items-center justify-between px-4 pt-4 pb-2">
										<View className="flex-row items-center gap-2">
											<View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
											<Text className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
												{item.serviceType === 'RIDE' ? 'Corrida' : 'Entrega'}
											</Text>
											<Text className="text-[10px] font-black" style={{ color: statusColor }}>
												{getStatusLabel(item.status)}
											</Text>
										</View>
										<Text className="text-base font-black text-secondary dark:text-off-white">
											{formatPrice(Number(item.totalPrice))}
										</Text>
									</View>

									{/* Route */}
									<View className="flex-row items-start px-4 pb-3 gap-3">
										<View className="items-center">
											<View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
											<View className="w-0.5 h-5 bg-gray-300 dark:bg-gray-700 my-0.5" />
											<View className="w-2.5 h-2.5 rounded-full bg-primary" />
										</View>
										<View className="flex-1 gap-0.5">
											<Text className="text-sm font-bold text-secondary dark:text-off-white" numberOfLines={1}>
												{item.pickupAddress}
											</Text>
											<Text className="text-sm font-bold text-secondary dark:text-off-white" numberOfLines={1}>
												{item.dropoffAddress}
											</Text>
										</View>
									</View>

									{/* Date footer */}
									<View className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
										<Text className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
											{formatDate(item.requestedAt)} • {formatTime(item.requestedAt)}
										</Text>
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

			{/* Filter Modal */}
			<Modal visible={isFilterModalOpen} transparent animationType="slide" onRequestClose={() => setIsFilterModalOpen(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end">
					<Pressable className="absolute inset-0 bg-black/50" onPress={() => setIsFilterModalOpen(false)} />
					<View className={`rounded-t-3xl pt-6 pb-10 px-6 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
						<View className="flex-row items-center justify-between mb-6">
							<Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
								Filtrar por Data
							</Text>
							<TouchableOpacity onPress={() => setIsFilterModalOpen(false)} className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
								<Ionicons name="close" size={20} color={isDark ? '#FFF' : '#000'} />
							</TouchableOpacity>
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
							<Text className={`text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
								Período
							</Text>
							<View className="flex-row flex-wrap gap-2 mb-6">
								{(['all', 'today', 'week', 'month', 'custom'] as const).map((f) => {
									const active = periodFilter === f;
									return (
										<TouchableOpacity
											key={f}
											className={`px-4 py-2.5 rounded-full ${active ? 'bg-primary' : isDark ? 'bg-[#1A1A1A] border border-gray-800' : 'bg-white border border-gray-200'}`}
											onPress={() => setPeriodFilter(f)}
											activeOpacity={0.7}
										>
											<Text className={`text-sm font-black ${active ? 'text-secondary' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
												{f === 'all' ? 'Qualquer' : f === 'today' ? 'Hoje' : f === 'week' ? 'Esta semana' : f === 'month' ? 'Este mês' : 'Personalizado'}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>

							{periodFilter === 'custom' && (
								<Animated.View entering={FadeInDown.duration(300)}>
									<View className="flex-row gap-4">
										<View className="flex-1">
											<Text className="text-xs font-bold mb-1.5 text-gray-500 dark:text-gray-400">Início</Text>
											<TouchableOpacity onPress={() => setShowStartPicker(true)} className={`px-4 py-3.5 flex-row items-center justify-between rounded-xl border ${isDark ? 'border-gray-800 bg-[#1A1A1A]' : 'border-gray-200 bg-gray-50'}`} activeOpacity={0.7}>
												<Text className={`text-sm font-bold ${customStart ? isDark ? 'text-white' : 'text-black' : 'text-gray-400'}`}>
													{customStart ? customStart.toLocaleDateString('pt-AO') : 'Selecionar...'}
												</Text>
												<Ionicons name="calendar-outline" size={16} color={isDark ? '#888' : '#A0A0A0'} />
											</TouchableOpacity>
											{showStartPicker && (
												<DateTimePicker value={customStart ?? new Date()} mode="date" display="default" onChange={(event: DateTimePickerEvent, date?: Date) => {
													setShowStartPicker(Platform.OS === 'ios');
													if (date) setCustomStart(date);
												}} />
											)}
										</View>
										<View className="flex-1">
											<Text className="text-xs font-bold mb-1.5 text-gray-500 dark:text-gray-400">Fim</Text>
											<TouchableOpacity onPress={() => setShowEndPicker(true)} className={`px-4 py-3.5 flex-row items-center justify-between rounded-xl border ${isDark ? 'border-gray-800 bg-[#1A1A1A]' : 'border-gray-200 bg-gray-50'}`} activeOpacity={0.7}>
												<Text className={`text-sm font-bold ${customEnd ? isDark ? 'text-white' : 'text-black' : 'text-gray-400'}`}>
													{customEnd ? customEnd.toLocaleDateString('pt-AO') : 'Selecionar...'}
												</Text>
												<Ionicons name="calendar-outline" size={16} color={isDark ? '#888' : '#A0A0A0'} />
											</TouchableOpacity>
											{showEndPicker && (
												<DateTimePicker value={customEnd ?? new Date()} mode="date" display="default" onChange={(event: DateTimePickerEvent, date?: Date) => {
													setShowEndPicker(Platform.OS === 'ios');
													if (date) setCustomEnd(date);
												}} />
											)}
										</View>
									</View>
								</Animated.View>
							)}
						</ScrollView>

						<View className="flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
							<TouchableOpacity className="flex-1 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 items-center" onPress={() => { setPeriodFilter('all'); setCustomStart(null); setCustomEnd(null); }}>
								<Text className={`text-sm font-black ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Limpar</Text>
							</TouchableOpacity>
							<TouchableOpacity className="flex-1 py-3.5 rounded-xl bg-primary items-center" onPress={() => setIsFilterModalOpen(false)}>
								<Text className="text-sm font-black text-secondary">Aplicar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}
