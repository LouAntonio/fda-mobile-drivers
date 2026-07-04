import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

export function StatCardSkeleton() {
	return (
		<View className="items-center py-3">
			<SkeletonBox width={64} height={24} borderRadius={6} />
			<SkeletonBox
				width={48}
				height={12}
				borderRadius={6}
				style={{ marginTop: 6 }}
			/>
		</View>
	);
}

export function StatCardGridSkeleton() {
	return (
		<View
			className="bg-white dark:bg-soft-black rounded-2xl p-4"
			style={{
				elevation: 2,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.05,
				shadowRadius: 8,
				borderWidth: 1,
				borderColor: 'rgba(0,0,0,0.04)',
			}}
		>
			<View className="flex-row flex-wrap">
				<View className="w-1/2">
					<StatCardSkeleton />
				</View>
				<View className="w-1/2">
					<StatCardSkeleton />
				</View>
				<View className="w-1/2">
					<StatCardSkeleton />
				</View>
				<View className="w-1/2">
					<StatCardSkeleton />
				</View>
			</View>
		</View>
	);
}
