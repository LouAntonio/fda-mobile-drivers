import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TripStatus =
	| 'REQUESTED'
	| 'ACCEPTED'
	| 'PICKUP_IN_PROGRESS'
	| 'STARTED'
	| 'COMPLETED'
	| 'CANCELLED';

export type ServiceType = 'RIDE' | 'DELIVERY';

export interface TripItem {
	id: string;
	pickupAddress: string;
	dropoffAddress: string;
	requestedAt: string;
	totalPrice: number;
	status: TripStatus;
	serviceType: ServiceType;
	actualDistanceKm?: number | null;
	actualDurationMin?: number | null;
	paymentMethod?: string;
	completedAt?: string | null;
	cancelledAt?: string | null;
}

interface TripCardProps {
	trip: TripItem;
	onPress?: () => void;
}

const statusConfig: Record<TripStatus, { label: string; color: string }> = {
	REQUESTED: { label: 'Solicitada', color: '#F59E0B' },
	ACCEPTED: { label: 'Aceite', color: '#3B82F6' },
	PICKUP_IN_PROGRESS: { label: 'Busca', color: '#3B82F6' },
	STARTED: { label: 'Em Andamento', color: '#3B82F6' },
	COMPLETED: { label: 'Concluída', color: '#10B981' },
	CANCELLED: { label: 'Cancelada', color: '#ED1C24' },
};

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

function formatTripDate(iso: string): string {
	const d = new Date(iso);
	const date = d.toLocaleDateString('pt-AO', {
		day: '2-digit',
		month: 'short',
	});
	const time = d.toLocaleTimeString('pt-AO', {
		hour: '2-digit',
		minute: '2-digit',
	});
	return `${date}, ${time}`;
}

export function TripCard({ trip, onPress }: TripCardProps) {
	const cfg = statusConfig[trip.status];
	const serviceIcon =
		trip.serviceType === 'RIDE' ? 'car-outline' : 'cube-outline';
	const serviceLabel = trip.serviceType === 'RIDE' ? 'Corrida' : 'Entrega';

	return (
		<TouchableOpacity
			className="flex-row bg-white dark:bg-soft-black rounded-2xl mb-3 overflow-hidden active:opacity-70"
			style={styles.card}
			onPress={onPress}
			activeOpacity={0.7}
		>
			{/* Left accent bar */}
			<View style={{ width: 4, backgroundColor: cfg.color }} />

			<View className="flex-1 p-4">
				<View className="flex-row items-center justify-between mb-2">
					<View className="flex-row items-center gap-1.5">
						<Ionicons
							name={serviceIcon}
							size={14}
							color={cfg.color}
						/>
						<Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
							{serviceLabel}
						</Text>
					</View>
					<Text className="text-base font-extrabold text-secondary dark:text-off-white">
						{formatPrice(trip.totalPrice)}
					</Text>
				</View>

				<View className="flex-row items-center">
					<Text
						className="text-sm font-bold text-secondary dark:text-off-white flex-shrink"
						numberOfLines={1}
					>
						{trip.pickupAddress}
					</Text>
					<Ionicons
						name="arrow-forward"
						size={12}
						color="#9CA3AF"
						style={{ marginHorizontal: 4, flexShrink: 0 }}
					/>
					<Text
						className="text-sm font-bold text-secondary dark:text-off-white flex-shrink"
						numberOfLines={1}
					>
						{trip.dropoffAddress}
					</Text>
				</View>

				<Text className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1.5">
					{formatTripDate(trip.requestedAt)}
				</Text>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
		borderWidth: 1,
		borderColor: 'rgba(0,0,0,0.04)',
	},
});
