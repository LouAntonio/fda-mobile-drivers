import React from 'react';
import { View, Text } from 'react-native';

export interface StatItem {
	id: string;
	label: string;
	value: string;
}

interface StatCardProps {
	stat: StatItem;
}

export function StatCard({ stat }: StatCardProps) {
	return (
		<View className="items-center py-3">
			<Text className="text-2xl font-extrabold text-secondary dark:text-off-white tracking-tight">
				{stat.value}
			</Text>
			<Text className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">
				{stat.label}
			</Text>
		</View>
	);
}
