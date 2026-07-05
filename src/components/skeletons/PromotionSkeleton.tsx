import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

interface PromotionSkeletonProps {
	isDark?: boolean;
}

export function PromotionSkeleton({ isDark }: PromotionSkeletonProps) {
	return (
		<View
			className="rounded-3xl mb-4 overflow-hidden"
			style={{
				backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
				elevation: 4,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 6 },
				shadowOpacity: 0.08,
				shadowRadius: 12,
			}}
		>
			<View className="p-5">
				<View className="flex-row justify-between items-center mb-4">
					<SkeletonBox width={80} height={24} borderRadius={8} />
					<SkeletonBox width={36} height={36} borderRadius={12} />
				</View>
				<View className="flex-row items-center gap-4 mb-5">
					<SkeletonBox width={65} height={65} borderRadius={18} />
					<View className="flex-1 gap-2">
						<SkeletonBox width="80%" height={18} borderRadius={6} />
						<SkeletonBox
							width="100%"
							height={14}
							borderRadius={6}
						/>
					</View>
				</View>
				<View className="flex-row justify-between items-center pt-4 border-t border-gray-200/20">
					<SkeletonBox width={90} height={28} borderRadius={10} />
					<SkeletonBox width={100} height={14} borderRadius={6} />
				</View>
			</View>
		</View>
	);
}
