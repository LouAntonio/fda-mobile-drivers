import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

export function TripDetailSkeleton() {
	return (
		<View className="flex-1 bg-off-white dark:bg-[#090909]">
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
				<SkeletonBox width={40} height={40} borderRadius={12} />
				<SkeletonBox width={120} height={20} borderRadius={6} />
				<View className="w-8" />
			</View>

			<View className="px-4 pb-10">
				<View className="mt-4 mb-4">
					<SkeletonBox width={200} height={32} borderRadius={8} />
				</View>

				<View className="flex-row gap-2 mb-6">
					<SkeletonBox width={100} height={28} borderRadius={12} />
					<SkeletonBox width={80} height={28} borderRadius={12} />
				</View>

				<SkeletonBox
					height={180}
					borderRadius={24}
					style={{ marginBottom: 24 }}
				/>

				<View className="bg-white dark:bg-soft-black rounded-3xl p-5 mb-4">
					{['60%', '85%', '40%'].map((w, i) => (
						<SkeletonBox
							key={i}
							width={w}
							height={16}
							borderRadius={6}
							style={{ marginBottom: 12 }}
						/>
					))}
				</View>

				<View className="bg-white dark:bg-soft-black rounded-3xl p-5 mb-4">
					<SkeletonBox
						width="50%"
						height={16}
						borderRadius={6}
						style={{ marginBottom: 16 }}
					/>
					<View className="flex-row justify-between mb-3">
						<SkeletonBox width="40%" height={14} borderRadius={6} />
						<SkeletonBox width="25%" height={14} borderRadius={6} />
					</View>
					<View className="flex-row justify-between mb-3">
						<SkeletonBox width="30%" height={14} borderRadius={6} />
						<SkeletonBox width="25%" height={14} borderRadius={6} />
					</View>
					<View className="flex-row justify-between">
						<SkeletonBox width="35%" height={18} borderRadius={6} />
						<SkeletonBox width="25%" height={18} borderRadius={6} />
					</View>
				</View>
			</View>
		</View>
	);
}
