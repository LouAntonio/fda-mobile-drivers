import React, { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Switch,
	Alert,
	TextInput,
	Modal,
	Pressable,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useThemeStore } from '../../store/themeStore';
import { useMutation } from '@tanstack/react-query';
import { deleteAccount } from '../../api/account';
import { useAuthStore } from '../../store/authStore';

export default function SettingsScreen() {
	const navigation = useNavigation();
	const { themeColors, isDark } = useThemeColors();
	const { theme, setTheme } = useThemeStore();

	const cardBgStyle = {
		backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
	};

	const themeOptions = [
		{
			label: 'Claro',
			value: 'light' as const,
			icon: 'sunny',
		},
		{
			label: 'Escuro',
			value: 'dark' as const,
			icon: 'moon',
		},
		{
			label: 'Sistema',
			value: 'system' as const,
			icon: 'settings',
		},
	];

	const logout = useAuthStore((state) => state.logout);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletePassword, setDeletePassword] = useState('');

	const deleteMutation = useMutation({
		mutationFn: (password?: string) => deleteAccount(password),
		onSuccess: () => {
			logout();
			(navigation as any).reset({
				index: 0,
				routes: [{ name: 'Auth' }],
			});
		},
		onError: (err: any) => {
			const msg =
				err?.response?.data?.msg || 'Erro ao eliminar conta. Tenta novamente.';
			Alert.alert('Erro', msg);
		},
	});

	const handleDeleteAccount = () => {
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = () => {
		setShowDeleteModal(false);
		deleteMutation.mutate(deletePassword || undefined);
	};

	return (
		<SafeAreaView
			style={[
				styles.container,
				{ backgroundColor: themeColors.background },
			]}
		>
			{/* Header */}
			<View
				style={[
					styles.header,
					{ borderBottomColor: themeColors.border },
				]}
			>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backButton}
					activeOpacity={0.7}
				>
					<Ionicons
						name="chevron-back"
						size={28}
						color={themeColors.text}
					/>
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: themeColors.text }]}>
					Configurações
				</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Theme */}
				<Animated.View entering={FadeInDown.duration(600)}>
					<Text
						style={[
							styles.sectionTitle,
							{ color: themeColors.text },
						]}
					>
						Aparência
					</Text>
					<View
						style={[
							styles.themeSwitcherContainer,
							// eslint-disable-next-line react-native/no-inline-styles
							{ backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' },
						]}
					>
						{themeOptions.map((option) => {
							const isSelected = theme === option.value;
							return (
								<TouchableOpacity
									key={option.value}
									style={[
										styles.themeSwitcherItem,
										isSelected && [
											styles.themeSwitcherItemSelected,
											{
												backgroundColor: isDark
													? '#3A3A3C'
													: '#FFFFFF',
											},
										],
									]}
									onPress={() => setTheme(option.value)}
									activeOpacity={isSelected ? 1 : 0.7}
								>
									<Ionicons
										name={option.icon as any}
										size={18}
										color={
											isSelected
												? themeColors.text
												: themeColors.secondary
										}
										// eslint-disable-next-line react-native/no-inline-styles
										style={{ marginRight: 6 }}
									/>
									<Text
										style={[
											styles.themeSwitcherLabel,
											{
												color: isSelected
													? themeColors.text
													: themeColors.secondary,
											},
										]}
									>
										{option.label}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</Animated.View>

				{/* Notifications */}
				<Animated.View
					entering={FadeInDown.duration(600).delay(150)}
					style={styles.section}
				>
					<Text
						style={[
							styles.sectionTitle,
							{ color: themeColors.text },
						]}
					>
						Notificações
					</Text>
					<View style={[styles.settingsCard, cardBgStyle]}>
						<NotificationToggle
							icon="notifications"
							label="Notificações Push"
							sublabel="Receber alertas de corrida"
							defaultValue={true}
							colors={themeColors}
							iconColor="#FF9500"
							isLast={false}
						/>
						<NotificationToggle
							icon="mail"
							label="Notificações por E-mail"
							sublabel="Recibos e atualizações"
							defaultValue={false}
							colors={themeColors}
							iconColor="#007AFF"
							isLast={false}
						/>
						<NotificationToggle
							icon="volume-high"
							label="Sons"
							sublabel="Sons de notificação"
							defaultValue={true}
							colors={themeColors}
							iconColor="#34C759"
							isLast={true}
						/>
					</View>
				</Animated.View>

				{/* App */}
				<Animated.View
					entering={FadeInDown.duration(600).delay(300)}
					style={styles.section}
				>
					<Text
						style={[
							styles.sectionTitle,
							{ color: themeColors.text },
						]}
					>
						Aplicativo
					</Text>
					<View style={[styles.settingsCard, cardBgStyle]}>
						<Animated.View
							entering={FadeInRight.duration(400).delay(100)}
						>
							<TouchableOpacity
								style={styles.settingRow}
								onPress={handleDeleteAccount}
								activeOpacity={0.7}
							>
								<View
									style={[
										styles.iconBackground,
										{
											backgroundColor:
												themeColors.error + '15',
										},
									]}
								>
									<Ionicons
										name="trash-outline"
										size={22}
										color={themeColors.error}
									/>
								</View>
								<View style={styles.settingInfo}>
									<Text
										style={[
											styles.settingLabel,
											{ color: themeColors.error },
										]}
									>
										Excluir Conta
									</Text>
									<Text
										style={[
											styles.settingSublabel,
											{ color: themeColors.error },
										]}
									>
										Ação irreversível
									</Text>
								</View>
								<Ionicons
									name="chevron-forward"
									size={20}
									color={themeColors.error}
								/>
							</TouchableOpacity>
						</Animated.View>
					</View>
				</Animated.View>

				{/* Version */}
				<Animated.View
					entering={FadeInDown.duration(600).delay(500)}
					style={styles.versionSection}
				>
					<Text
						style={[
							styles.versionText,
							{ color: themeColors.secondary },
						]}
					>
						Flash Delivery Angola v1.0.0
					</Text>
					<Text
						style={[
							styles.copyrightText,
							{ color: themeColors.secondary },
						]}
					>
						© 2026 Flash Delivery. Todos os direitos reservados.
					</Text>
				</Animated.View>
			</ScrollView>

			{/* Delete Account Modal */}
			<Modal
				visible={showDeleteModal}
				animationType="fade"
				transparent
				onRequestClose={() => setShowDeleteModal(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1 justify-center"
				>
					<Pressable
						className="absolute inset-0 bg-black/60"
						onPress={() => setShowDeleteModal(false)}
					/>
					<Animated.View entering={FadeInDown.duration(300).springify()}>
						<View
							className="mx-6 rounded-[32px] p-6"
							style={{
								backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
							}}
						>
							<View className="items-center mb-6">
								<View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-4">
									<Ionicons
										name="warning-outline"
										size={32}
										color="#EF4444"
									/>
								</View>
								<Text
									className="text-xl font-black text-center"
									style={{ color: themeColors.text }}
								>
									Eliminar Conta
								</Text>
								<Text
									className="text-sm text-center mt-2"
									style={{ color: themeColors.text + '99' }}
								>
									Esta ação é irreversível. Todos os teus dados
									serão removidos permanentemente.
								</Text>
							</View>

							<TextInput
								className="w-full px-4 py-3.5 rounded-2xl mb-4 text-base"
								placeholder="Palavra-passe (se tiveres)"
								placeholderTextColor="#9CA3AF"
								secureTextEntry
								value={deletePassword}
								onChangeText={setDeletePassword}
								style={{
									backgroundColor: isDark
										? '#2C2C2E'
										: '#F5F5F5',
									color: themeColors.text,
								}}
							/>

							<View className="flex-row gap-3">
								<TouchableOpacity
									className="flex-1 py-3.5 rounded-2xl"
									style={{
										backgroundColor: isDark
											? '#2C2C2E'
											: '#F5F5F5',
									}}
									onPress={() => {
										setShowDeleteModal(false);
										setDeletePassword('');
									}}
									activeOpacity={0.7}
								>
									<Text
										className="text-center font-bold"
										style={{ color: themeColors.text }}
									>
										Cancelar
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									className="flex-1 py-3.5 rounded-2xl"
									style={{ backgroundColor: '#EF4444' }}
									onPress={handleConfirmDelete}
									activeOpacity={0.7}
								>
									<Text className="text-center font-bold text-white">
										{deleteMutation.isPending
											? 'A eliminar...'
											: 'Eliminar'}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</Animated.View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}

function NotificationToggle({
	icon,
	label,
	sublabel,
	defaultValue,
	colors,
	iconColor,
	isLast,
}: {
	icon: string;
	label: string;
	sublabel: string;
	defaultValue: boolean;
	colors: Record<string, string>;
	iconColor: string;
	isLast: boolean;
}) {
	const [enabled, setEnabled] = useState(defaultValue);

	return (
		<Animated.View entering={FadeInRight.duration(400)}>
			<View
				style={[
					styles.settingRow,
					// eslint-disable-next-line react-native/no-inline-styles
					!isLast && {
						borderBottomColor: colors.border,
						borderBottomWidth: 0.5,
					},
				]}
			>
				<View
					style={[
						styles.iconBackground,
						{ backgroundColor: iconColor + '15' },
					]}
				>
					<Ionicons name={icon as any} size={22} color={iconColor} />
				</View>
				<View style={styles.settingInfo}>
					<Text style={[styles.settingLabel, { color: colors.text }]}>
						{label}
					</Text>
					<Text
						style={[
							styles.settingSublabel,
							{ color: colors.text + '80' },
						]}
					>
						{sublabel}
					</Text>
				</View>
				<Switch
					value={enabled}
					onValueChange={setEnabled}
					trackColor={{
						false: '#D1D3D4',
						true: colors.primary,
					}}
					thumbColor="#FFFFFF"
				/>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderBottomWidth: 0.5,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '900',
	},
	placeholder: {
		width: 40,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 40,
		paddingTop: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '900',
		marginBottom: 16,
		marginLeft: 4,
		letterSpacing: -0.5,
	},
	themeSwitcherContainer: {
		flexDirection: 'row',
		borderRadius: 16,
		padding: 4,
		marginBottom: 32,
	},
	themeSwitcherItem: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		borderRadius: 12,
	},
	themeSwitcherItemSelected: {
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	themeSwitcherLabel: {
		fontSize: 14,
		fontWeight: '700',
	},
	section: {
		marginBottom: 32,
	},
	settingsCard: {
		borderRadius: 22,
		overflow: 'hidden',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 10,
	},
	settingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 18,
		paddingVertical: 18,
	},
	settingInfo: {
		flex: 1,
		marginLeft: 14,
	},
	iconBackground: {
		width: 42,
		height: 42,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	settingLabel: {
		fontSize: 15,
		fontWeight: '800',
	},
	settingSublabel: {
		fontSize: 12,
		fontWeight: '600',
		marginTop: 2,
	},
	versionSection: {
		alignItems: 'center',
		paddingVertical: 20,
	},
	versionText: {
		fontSize: 13,
		fontWeight: '700',
		opacity: 0.8,
	},
	copyrightText: {
		fontSize: 11,
		fontWeight: '500',
		marginTop: 4,
		opacity: 0.5,
	},
});
