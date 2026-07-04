import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

export function TripCardSkeleton() {
	return (
		<View
			className="flex-row bg-white dark:bg-soft-black rounded-2xl mb-3 overflow-hidden"
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
			<View style={{ width: 4, backgroundColor: '#E5E7EB' }} />
			<View className="flex-1 p-4 gap-2">
				<View className="flex-row items-center justify-between">
					<SkeletonBox width={80} height={14} borderRadius={6} />
					<SkeletonBox width={70} height={18} borderRadius={6} />
				</View>
				<SkeletonBox width="90%" height={14} borderRadius={6} />
				<SkeletonBox width="45%" height={12} borderRadius={6} />
			</View>
		</View>
	);
}
