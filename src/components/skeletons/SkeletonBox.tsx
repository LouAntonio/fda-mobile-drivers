import React, { useEffect } from 'react';

import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';

interface SkeletonBoxProps {
	width?: number | string;
	height?: number | string;
	borderRadius?: number;
	style?: Record<string, unknown>;
}

export function SkeletonBox({
	width = '100%',
	height = 20,
	borderRadius = 8,
	style,
}: SkeletonBoxProps) {
	const opacity = useSharedValue(0.3);

	useEffect(() => {
		opacity.value = withRepeat(
			withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
		);
	}, [opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	return (
		<Animated.View
			style={[
				{
					width: width as any,
					height: height as any,
					borderRadius,
					backgroundColor: '#E5E7EB',
				},
				animatedStyle,
				style,
			]}
		/>
	);
}
