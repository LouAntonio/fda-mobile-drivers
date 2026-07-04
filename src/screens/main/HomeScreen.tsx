import React, { useState, useMemo } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAuthStore } from '../../store/authStore';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import SideMenu from '../../components/SideMenu';

export default function HomeScreen() {
	const navigation = useNavigation<any>();
	const { themeColors, isDark } = useThemeColors();
	const user = useAuthStore((state) => state.user);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { location: currentLocation } = useCurrentLocation();

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const cardBgStyle = useMemo(
		() => ({
			backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
		}),
		[isDark],
	);

	const recentDestinations = [
		{
			id: '1',
			title: 'Casa',
			address: 'Rocha Cabine, Luanda',
			icon: 'home',
			latitude: -8.8399,
			longitude: 13.2344,
		},
		{
			id: '2',
			title: 'Trabalho',
			address: 'Edifício Kilamba, Marginal',
			icon: 'briefcase',
			latitude: -8.8147,
			longitude: 13.2306,
		},
		{
			id: '3',
			title: 'Belas Shopping',
			address: 'Talatona, Luanda',
			icon: 'cart',
			latitude: -8.9107,
			longitude: 13.2038,
		},
	];

	const handleRecentDestination = (
		longitude: number,
		latitude: number,
		name: string,
	) => {
		navigation.navigate('TripRequest', {
			serviceType: 'RIDE',
			pickupLat: latitude,
			pickupLng: longitude,
			pickupAddress: name,
		});
	};

	return (
		<SafeAreaView
			style={[
				styles.container,
				{ backgroundColor: themeColors.background },
			]}
		>
			<SideMenu
				isOpen={isMenuOpen}
				onClose={toggleMenu}
				userName={user?.name || 'Usuário'}
			/>

			<View
				style={[
					styles.header,
					{
						borderBottomColor: themeColors.border,
						backgroundColor: themeColors.background,
					},
				]}
			>
				<Image
					source={require('../../../assets/images/logo.png')}
					style={styles.logo}
				/>
				<TouchableOpacity
					onPress={toggleMenu}
					style={styles.menuButton}
					activeOpacity={0.7}
				>
					<Ionicons
						name="menu-outline"
						size={32}
						color={themeColors.text}
					/>
				</TouchableOpacity>
			</View>

			<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<Animated.View
						entering={FadeInDown.duration(800).delay(100)}
						style={styles.welcomeSection}
					>
						<Text
							style={[
								styles.welcomeText,
								{ color: themeColors.secondary },
							]}
						>
							Olá, {user?.name?.split(' ')[0] || 'Usuário'}
						</Text>
						<Text
							style={[
								styles.mainTitle,
								{ color: themeColors.text },
							]}
						>
							Para onde vamos?
						</Text>

					</Animated.View>

					<View style={styles.cardsContainer}>
						<Animated.View
							entering={FadeInRight.duration(800).delay(300)}
						>
							<TouchableOpacity
								style={[styles.serviceCard, cardBgStyle]}
								activeOpacity={0.8}
								onPress={() =>
									navigation.navigate('TripRequest', {
										serviceType: 'RIDE',
										pickupLat: currentLocation?.latitude,
										pickupLng: currentLocation?.longitude,
										pickupAddress: currentLocation?.address,
									})
								}
							>
								<View
									style={[
										styles.iconCircle,
										{ backgroundColor: themeColors.primary },
									]}
								>
									<MaterialCommunityIcons
										name="moped"
										size={36}
										color="#000"
									/>
								</View>
								<View>
									<Text
										style={[
											styles.cardTitle,
											{ color: themeColors.text },
										]}
									>
										Corrida
									</Text>
									<Text
										style={[
											styles.cardDesc,
											{ color: themeColors.secondary },
										]}
									>
										Viagens rápidas
									</Text>
								</View>
								<View
									style={[
										styles.cardBadge,
										{ backgroundColor: themeColors.primary },
									]}
								>
									<Ionicons
										name="arrow-forward"
										size={14}
										color="#000"
									/>
								</View>
							</TouchableOpacity>
						</Animated.View>

						<Animated.View
							entering={FadeInRight.duration(800).delay(500)}
						>
							<TouchableOpacity
								style={[styles.serviceCard, cardBgStyle]}
								activeOpacity={0.8}
								onPress={() =>
									navigation.navigate('TripRequest', {
										serviceType: 'DELIVERY',
										pickupLat: currentLocation?.latitude,
										pickupLng: currentLocation?.longitude,
										pickupAddress: currentLocation?.address,
									})
								}
							>
								<View
									style={[
										styles.iconCircle,
										{ backgroundColor: themeColors.primary },
									]}
								>
									<Ionicons
										name="cube"
										size={32}
										color="#000"
									/>
								</View>
								<View>
									<Text
										style={[
											styles.cardTitle,
											{ color: themeColors.text },
										]}
									>
										Entrega
									</Text>
									<Text
										style={[
											styles.cardDesc,
											{ color: themeColors.secondary },
										]}
									>
										Mande encomendas
									</Text>
								</View>
								<View
									style={[
										styles.cardBadge,
										{ backgroundColor: themeColors.primary },
									]}
								>
									<Ionicons
										name="arrow-forward"
										size={14}
										color="#000"
									/>
								</View>
							</TouchableOpacity>
						</Animated.View>
					</View>

					<Animated.View
						entering={FadeInDown.duration(800).delay(700)}
						style={styles.recentContainer}
					>
						<View style={styles.sectionHeader}>
							<Text
								style={[
									styles.sectionTitle,
									{ color: themeColors.text },
								]}
							>
								Locais recentes
							</Text>
						</View>

						{recentDestinations.map((item) => (
							<TouchableOpacity
								key={item.id}
								style={styles.recentItem}
								activeOpacity={0.6}
								onPress={() =>
									handleRecentDestination(
										item.longitude,
										item.latitude,
										item.address,
									)
								}
							>
								<View
									style={[
										styles.recentIcon,
										{
											backgroundColor:
												themeColors.border + '30',
										},
									]}
								>
									<Ionicons
										name={item.icon as any}
										size={22}
										color={themeColors.text}
									/>
								</View>
								<View style={styles.recentInfo}>
									<Text
										style={[
											styles.recentTitle,
											{ color: themeColors.text },
										]}
									>
										{item.title}
									</Text>
									<Text
										style={[
											styles.recentAddress,
											{ color: themeColors.secondary },
										]}
										numberOfLines={1}
									>
										{item.address}
									</Text>
								</View>
								<Ionicons
									name="chevron-forward"
									size={20}
									color={themeColors.border}
								/>
							</TouchableOpacity>
						))}
					</Animated.View>
				</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderBottomWidth: 0.5,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		zIndex: 10,
	},
	logo: {
		width: 45,
		height: 45,
		borderRadius: 12,
		resizeMode: 'cover',
	},
	menuButton: {
		width: 45,
		height: 45,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scrollContent: {
		paddingBottom: 40,
	},
	welcomeSection: {
		paddingHorizontal: 20,
		paddingTop: 10,
		marginBottom: 30,
	},
	welcomeText: {
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 4,
	},
	mainTitle: {
		fontSize: 22,
		fontWeight: '900',
		letterSpacing: -1,
		marginBottom: 20,
	},

	cardsContainer: {
		paddingHorizontal: 20,
		marginBottom: 35,
		gap: 15,
	},
	serviceCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 22,
		borderRadius: 30,
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.06,
		shadowRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(150,150,150,0.08)',
	},
	iconCircle: {
		width: 60,
		height: 60,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 20,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: '800',
		marginBottom: 2,
	},
	cardDesc: {
		fontSize: 13,
		fontWeight: '500',
		opacity: 0.7,
	},
	cardBadge: {
		marginLeft: 'auto',
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: 'center',
		alignItems: 'center',
	},
	recentContainer: {
		paddingHorizontal: 20,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: '900',
	},
	recentItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 18,
		backgroundColor: 'transparent',
	},
	recentIcon: {
		width: 52,
		height: 52,
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
		borderWidth: 1,
		borderColor: 'rgba(150,150,150,0.05)',
	},
	recentInfo: {
		flex: 1,
	},
	recentTitle: {
		fontSize: 17,
		fontWeight: '700',
		marginBottom: 2,
	},
	recentAddress: {
		fontSize: 14,
		fontWeight: '400',
		opacity: 0.6,
	},

});
