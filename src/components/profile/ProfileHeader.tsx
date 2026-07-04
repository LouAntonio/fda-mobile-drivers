import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileHeaderProps {
	name: string;
	surname: string;
	phoneNumber: string;
	email?: string | null;
	image?: string | null;
	phoneNumberVerified?: boolean;
	emailVerified?: boolean;
	onEditPress: () => void;
}

export function ProfileHeader({
	name,
	surname,
	phoneNumber,
	email,
	image,
	phoneNumberVerified,
	emailVerified,
	onEditPress,
}: ProfileHeaderProps) {
	const initials = `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();

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
			{/* Gold banner */}
			<View className="h-24 bg-primary relative">
				<View className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
				<View className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
			</View>

			{/* Avatar overlapping */}
			<View className="items-center -mt-12 mb-2">
				{image ? (
					<Image
						source={{ uri: image }}
						className="w-24 h-24 rounded-full border-4 border-white dark:border-soft-black"
						style={styles.avatarShadow}
					/>
				) : (
					<View
						className="w-24 h-24 rounded-full border-4 border-white dark:border-soft-black bg-primary items-center justify-center"
						style={styles.avatarShadow}
					>
						<Text className="text-3xl font-extrabold text-secondary">
							{initials}
						</Text>
					</View>
				)}
			</View>

			{/* Name */}
			<Text className="text-center text-2xl font-extrabold text-secondary dark:text-off-white tracking-tight">
				{name} {surname}
			</Text>

			{/* Contact info */}
			<View className="items-center mt-3 gap-2 px-5">
				<View className="flex-row items-center">
					<Ionicons name="call-outline" size={14} color="#6B7280" />
					<Text className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1.5">
						{phoneNumber}
					</Text>
					{phoneNumberVerified && (
						<Ionicons
							name="checkmark-circle"
							size={14}
							color="#10B981"
							style={{ marginLeft: 4 }}
						/>
					)}
				</View>
				{email && (
					<View className="flex-row items-center">
						<Ionicons name="mail-outline" size={14} color="#6B7280" />
						<Text className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1.5">
							{email}
						</Text>
						{emailVerified && (
							<Ionicons
								name="checkmark-circle"
								size={14}
								color="#10B981"
								style={{ marginLeft: 4 }}
							/>
						)}
					</View>
				)}
			</View>

			{/* Edit button */}
			<TouchableOpacity
				className="mx-5 mt-5 mb-6 flex-row items-center justify-center py-3 rounded-full border border-primary active:opacity-70"
				style={styles.editButton}
				onPress={onEditPress}
			>
				<Ionicons name="create-outline" size={16} color="#231F20" />
				<Text className="ml-2 text-sm font-bold text-secondary dark:text-off-white">
					Editar Perfil
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	avatarShadow: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
	},
	editButton: {
		shadowColor: '#FFD700',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
});
