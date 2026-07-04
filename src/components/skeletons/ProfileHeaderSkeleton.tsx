import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from './SkeletonBox';

export function ProfileHeaderSkeleton() {
	return (
		<View
			className="bg-white dark:bg-soft-black rounded-[28px] overflow-hidden"
			style={{
				elevation: 4,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.1,
				shadowRadius: 16,
			}}
		>
			<SkeletonBox height={96} borderRadius={0} />
			<View className="items-center -mt-12 mb-2">
				<SkeletonBox
					width={96}
					height={96}
					borderRadius={48}
					style={{ borderWidth: 4, borderColor: '#FFF' }}
				/>
			</View>
			<SkeletonBox
				width={160}
				height={24}
				borderRadius={6}
				style={{ alignSelf: 'center', marginTop: 8 }}
			/>
			<View className="items-center mt-3 gap-2">
				<SkeletonBox width={180} height={14} borderRadius={6} />
				<SkeletonBox width={200} height={14} borderRadius={6} />
			</View>
			<SkeletonBox
				width={140}
				height={44}
				borderRadius={22}
				style={{ alignSelf: 'center', marginTop: 20, marginBottom: 24 }}
			/>
		</View>
	);
}
