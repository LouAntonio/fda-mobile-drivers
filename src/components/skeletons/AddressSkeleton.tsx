import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

export function AddressSkeleton() {
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
			<View className="flex-row items-center flex-1 p-4 gap-3">
				<SkeletonBox width={44} height={44} borderRadius={14} />
				<View className="flex-1 gap-1.5">
					<SkeletonBox width="35%" height={16} borderRadius={6} />
					<SkeletonBox width="65%" height={14} borderRadius={6} />
				</View>
				<SkeletonBox width={36} height={36} borderRadius={18} />
			</View>
		</View>
	);
}

export function AddressListSkeleton() {
	return (
		<View className="mt-4 px-5">
			<AddressSkeleton />
			<AddressSkeleton />
			<AddressSkeleton />
			<AddressSkeleton />
		</View>
	);
}
