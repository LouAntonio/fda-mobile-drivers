import React, { useEffect, useMemo } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	ScrollView,
	Pressable,
	Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	interpolate,
	Extrapolation,
	FadeInLeft,
} from 'react-native-reanimated';
import { useThemeColors } from '../hooks/useThemeColors';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { logoutUser } from '../services/auth';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

interface SideMenuProps {
	isOpen: boolean;
	onClose: () => void;
	userName?: string;
}

export default function SideMenu({
	isOpen,
	onClose,
	userName = 'Usuário',
}: SideMenuProps) {
	const { themeColors, isDark } = useThemeColors();
	const navigation = useNavigation();
	const drawerPos = useSharedValue(-DRAWER_WIDTH);

	useEffect(() => {
		drawerPos.value = withSpring(isOpen ? 0 : -DRAWER_WIDTH, {
			damping: 20,
			stiffness: 90,
			mass: 0.8,
		});
	}, [isOpen, drawerPos]);

	const drawerAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: drawerPos.value }],
	}));

	const overlayAnimatedStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			drawerPos.value,
			[-DRAWER_WIDTH, 0],
			[0, 1],
			Extrapolation.CLAMP,
		),
		zIndex: drawerPos.value > -DRAWER_WIDTH ? 999 : -1,
	}));

	const drawerBgStyle = useMemo(
		() => ({
			backgroundColor: isDark ? '#121212' : '#FFFFFF',
		}),
		[isDark],
	);

	const dividerStyle = useMemo(
		() => ({
			backgroundColor: themeColors.border,
		}),
		[themeColors.border],
	);

	const handleLogout = () => {
		Alert.alert('Sair da Conta', 'Tem certeza que deseja sair?', [
			{
				text: 'Cancelar',
				style: 'cancel',
			},
			{
				text: 'Sair',
				style: 'destructive',
				onPress: async () => {
					const { refreshToken, accessToken } =
						useAuthStore.getState();
					if (refreshToken && accessToken) {
						try {
							await logoutUser(refreshToken);
						} catch {
							// Ignore API error on logout
						}
					}
					useAuthStore.getState().logout();
					(navigation as any).reset({
						index: 0,
						routes: [{ name: 'Auth' }],
					});
				},
			},
		]);
	};

	return (
		<>
			{/* Overlay */}
			<Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
				<Pressable style={styles.flex1} onPress={onClose} />
			</Animated.View>

			{/* Side Menu */}
			<Animated.View
				style={[styles.drawer, drawerBgStyle, drawerAnimatedStyle]}
			>
				<View style={styles.flex1}>
					{/* Header Section */}
					<View style={styles.drawerHeader}>
						<View style={styles.profileContainer}>
							<View
								style={[
									styles.avatarContainer,
									{ backgroundColor: themeColors.primary },
								]}
							>
								<Ionicons
									name="person"
									size={38}
									color="#000"
								/>
							</View>
							<View style={styles.profileInfo}>
								<Text
									numberOfLines={1}
									style={[
										styles.userName,
										{ color: themeColors.text },
									]}
								>
									{userName}
								</Text>
								<TouchableOpacity
									activeOpacity={0.7}
									onPress={() => {
										navigation.navigate('Profile' as never);
										onClose();
									}}
								>
									<Text
										style={[
											styles.viewProfileText,
											{ color: themeColors.primary },
										]}
									>
										Ver Perfil
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
					<View
						style={[
							styles.drawerDivider,
							dividerStyle,
							styles.profileDivider,
						]}
					/>

					<ScrollView
						style={styles.drawerItems}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollPadding}
					>
						<SectionHeader
							title="Viagens"
							color={themeColors.secondary}
						/>
						<DrawerItem
							icon="time-outline"
							label="Histórico"
							color={themeColors.text}
							delay={100}
							onPress={() => {
								navigation.navigate('History' as never);
								onClose();
							}}
						/>

						<View style={[styles.drawerDivider, dividerStyle]} />
						<SectionHeader
							title="Ganhos"
							color={themeColors.secondary}
						/>
						<DrawerItem
							icon="wallet-outline"
							label="Meus Ganhos"
							color={themeColors.text}
							delay={200}
							onPress={() => {
								navigation.navigate('DriverEarnings' as never);
								onClose();
							}}
						/>
						<DrawerItem
							icon="car-outline"
							label="Meu Veículo"
							color={themeColors.text}
							delay={300}
							onPress={() => {
								navigation.navigate('DriverVehicle' as never);
								onClose();
							}}
						/>
						<DrawerItem
							icon="document-text-outline"
							label="Documentos"
							color={themeColors.text}
							delay={400}
							onPress={() => {
								navigation.navigate('DriverDocuments' as never);
								onClose();
							}}
						/>

						<View style={[styles.drawerDivider, dividerStyle]} />
						<SectionHeader
							title="Ajuda"
							color={themeColors.secondary}
						/>
						<DrawerItem
							icon="information-circle-outline"
							label="Central de Ajuda"
							color={themeColors.text}
							delay={500}
							onPress={() => {
								navigation.navigate('Info' as never);
								onClose();
							}}
						/>
						<DrawerItem
							icon="headset-outline"
							label="Fale Conosco"
							color={themeColors.text}
							delay={600}
							onPress={() => {
								navigation.navigate('Contact' as never);
								onClose();
							}}
						/>

						<View style={[styles.drawerDivider, dividerStyle]} />
						<DrawerItem
							icon="settings-outline"
							label="Configurações"
							color={themeColors.text}
							delay={700}
							onPress={() => {
								navigation.navigate('Settings' as never);
								onClose();
							}}
						/>
					</ScrollView>
				</View>

				{/* Footer Actions */}
				<View style={styles.footerSection}>
					<View
						style={[
							styles.drawerDivider,
							dividerStyle,
							styles.footerDivider,
						]}
					/>
					<TouchableOpacity
						style={styles.logoutButton}
						onPress={handleLogout}
						activeOpacity={0.7}
					>
						<View
							style={[
								styles.logoutIconContainer,
								{ backgroundColor: themeColors.error + '15' },
							]}
						>
							<Ionicons
								name="log-out-outline"
								size={22}
								color={themeColors.error}
							/>
						</View>
						<Text
							style={[
								styles.logoutLabel,
								{ color: themeColors.error },
							]}
						>
							Sair da Conta
						</Text>
					</TouchableOpacity>

					<View style={styles.drawerFooter}>
						<Text
							style={[
								styles.versionText,
								{ color: themeColors.secondary },
							]}
						>
							FLASH DELIVERY • v1.0.0
						</Text>
					</View>
				</View>
			</Animated.View>
		</>
	);
}

function SectionHeader({ title, color }: { title: string; color: string }) {
	return (
		<Text style={[styles.sectionHeader, { color }]}>
			{title.toUpperCase()}
		</Text>
	);
}

function DrawerItem({
	icon,
	label,
	color,
	delay = 0,
	onPress,
}: {
	icon: string;
	label: string;
	color: string;
	delay?: number;
	onPress: () => void;
}) {
	const { isDark } = useThemeColors();
	const iconBgStyle = useMemo(
		() => ({
			backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
		}),
		[isDark],
	);

	return (
		<Animated.View
			entering={FadeInLeft.delay(delay).duration(400).springify()}
		>
			<TouchableOpacity
				style={styles.drawerItem}
				onPress={onPress}
				activeOpacity={0.6}
			>
				<View style={[styles.drawerItemIconContainer, iconBgStyle]}>
					<Ionicons name={icon as any} size={20} color={color} />
				</View>
				<Text style={[styles.drawerItemLabel, { color }]}>{label}</Text>
			</TouchableOpacity>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	flex1: {
		flex: 1,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	drawer: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: DRAWER_WIDTH,
		zIndex: 1000,
		paddingTop: 50,
		borderTopRightRadius: 32,
		borderBottomRightRadius: 32,
		elevation: 20,
		shadowColor: '#000',
		shadowOffset: { width: 10, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
	},
	drawerHeader: {
		paddingHorizontal: 25,
		paddingBottom: 30,
	},
	profileContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatarContainer: {
		width: 64,
		height: 64,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
	},
	profileInfo: {
		marginLeft: 16,
		flex: 1,
	},
	userName: {
		fontSize: 20,
		fontWeight: '900',
		letterSpacing: -0.5,
		marginBottom: 2,
	},
	viewProfileText: {
		fontSize: 14,
		fontWeight: '700',
	},
	drawerItems: {
		flex: 1,
	},
	scrollPadding: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	sectionHeader: {
		fontSize: 11,
		fontWeight: '800',
		letterSpacing: 1.5,
		marginTop: 12,
		marginBottom: 6,
		marginLeft: 10,
		opacity: 0.6,
	},
	drawerItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderRadius: 16,
		marginBottom: 4,
	},
	drawerItemIconContainer: {
		width: 42,
		height: 42,
		borderRadius: 14,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	drawerItemLabel: {
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: -0.3,
	},
	drawerDivider: {
		height: 1,
		opacity: 0,
		marginHorizontal: 10,
	},
	profileDivider: {
		marginHorizontal: 40,
		marginBottom: 15,
		opacity: 0.9,
		height: 1.5,
	},
	footerSection: {
		paddingHorizontal: 25,
		paddingBottom: 20,
	},
	footerDivider: {
		marginHorizontal: 0,
		marginBottom: 20,
	},
	logoutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 15,
		borderRadius: 16,
	},
	logoutIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 15,
	},
	logoutLabel: {
		fontSize: 16,
		fontWeight: '800',
	},
	drawerFooter: {
		paddingVertical: 15,
		alignItems: 'center',
	},
	versionText: {
		fontSize: 10,
		fontWeight: '800',
		opacity: 0.4,
		letterSpacing: 2,
	},
});
