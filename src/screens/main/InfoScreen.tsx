import React from 'react';
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';

const INFO_SECTIONS: {
	title: string;
	items: {
		icon: string;
		label: string;
		value?: string;
		url?: string;
	}[];
}[] = [
	{
		title: 'Sobre o App',
		items: [
			{
				icon: 'information-circle-outline',
				label: 'Versão',
				value: 'v1.0.0 (Build 2026.04)',
			},
		],
	},
	{
		title: 'Legal',
		items: [
			{
				icon: 'document-text-outline',
				label: 'Termos de Uso',
				url: 'https://flashdelivery.co.ao/termos',
			},
			{
				icon: 'shield-checkmark-outline',
				label: 'Política de Privacidade',
				url: 'https://flashdelivery.co.ao/privacidade',
			},
			{
				icon: 'receipt-outline',
				label: 'Política de Reembolso',
				url: 'https://flashdelivery.co.ao/reembolso',
			},
		],
	},
	{
		title: 'Ajuda',
		items: [
			{
				icon: 'help-circle-outline',
				label: 'FAQ - Perguntas Frequentes',
				url: 'https://flashdelivery.co.ao/faq',
			},
			{
				icon: 'book-outline',
				label: 'Guia do Usuário',
				url: 'https://flashdelivery.co.ao/guia',
			},
		],
	},
];

export default function InfoScreen() {
	const navigation = useNavigation();
	const { themeColors, isDark } = useThemeColors();

	const cardBgStyle = {
		backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
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
					Informações
				</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Logo & Brand */}
				<Animated.View
					entering={FadeInDown.duration(600)}
					style={styles.brandSection}
				>
					<View style={styles.logoContainer}>
						<Text style={styles.logoText}>FLASH</Text>
						<Text
							style={[
								styles.logoSubtext,
								{ color: themeColors.secondary },
							]}
						>
							DELIVERY ANGOLA
						</Text>
					</View>
					<Text
						style={[
							styles.tagline,
							{ color: themeColors.secondary },
						]}
					>
						Viagens rápidas e entregas seguras em toda Luanda.
					</Text>
				</Animated.View>

				{/* Info Sections */}
				{INFO_SECTIONS.map((section, sIndex) => (
					<Animated.View
						key={section.title}
						entering={FadeInDown.duration(500).delay(
							200 + sIndex * 150,
						)}
						style={styles.section}
					>
						<Text
							style={[
								styles.sectionTitle,
								{ color: themeColors.text },
							]}
						>
							{section.title}
						</Text>
						<View style={[styles.sectionCard, cardBgStyle]}>
							{section.items.map((item, iIndex) => (
								<Animated.View
									key={item.label}
									entering={FadeInRight.duration(400).delay(
										iIndex * 80,
									)}
								>
									<TouchableOpacity
										style={[
											styles.itemRow,
											iIndex <
												// eslint-disable-next-line react-native/no-inline-styles
												section.items.length - 1 && {
												borderBottomColor:
													themeColors.border,
												borderBottomWidth: 0.5,
											},
										]}
										activeOpacity={item.url ? 0.6 : 1}
										disabled={!item.url}
										onPress={
											item.url
												? () =>
														Linking.openURL(
															item.url!,
														)
												: undefined
										}
									>
										<View style={styles.itemIconContainer}>
											<Ionicons
												name={item.icon as any}
												size={22}
												color={themeColors.secondary}
											/>
										</View>
										<View style={styles.itemInfo}>
											<Text
												style={[
													styles.itemLabel,
													{ color: themeColors.text },
												]}
											>
												{item.label}
											</Text>
											{item.value && (
												<Text
													style={[
														styles.itemValue,
														{
															color: themeColors.secondary,
														},
													]}
												>
													{item.value}
												</Text>
											)}
										</View>
										{item.url && (
											<Ionicons
												name="chevron-forward"
												size={20}
												color={themeColors.border}
											/>
										)}
									</TouchableOpacity>
								</Animated.View>
							))}
						</View>
					</Animated.View>
				))}

				{/* Social */}
				<Animated.View
					entering={FadeInDown.duration(600).delay(700)}
					style={styles.socialSection}
				>
					<Text
						style={[
							styles.sectionTitle,
							{ color: themeColors.text },
						]}
					>
						Redes Sociais
					</Text>
					<View style={[styles.socialCard, cardBgStyle]}>
						{[
							{
								icon: 'logo-instagram',
								label: 'Instagram',
								url: 'https://instagram.com/flashdeliveryao',
							},
							{
								icon: 'logo-facebook',
								label: 'Facebook',
								url: 'https://facebook.com/flashdeliveryao',
							},
							{
								icon: 'logo-twitter',
								label: 'Twitter / X',
								url: 'https://twitter.com/flashdeliveryao',
							},
						].map((social) => (
							<TouchableOpacity
								key={social.label}
								style={styles.socialItem}
								activeOpacity={0.6}
								onPress={() => Linking.openURL(social.url)}
							>
								<Ionicons
									name={social.icon as any}
									size={28}
									color={themeColors.text}
								/>
								<Text
									style={[
										styles.socialLabel,
										{ color: themeColors.text },
									]}
								>
									{social.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>
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
	brandSection: {
		alignItems: 'center',
		paddingVertical: 20,
		marginBottom: 10,
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 8,
	},
	logoText: {
		fontSize: 36,
		fontWeight: '900',
		color: '#FFD700',
		letterSpacing: 4,
	},
	logoSubtext: {
		fontSize: 12,
		fontWeight: '800',
		letterSpacing: 6,
	},
	tagline: {
		fontSize: 14,
		fontWeight: '500',
		textAlign: 'center',
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '800',
		marginBottom: 12,
	},
	sectionCard: {
		borderRadius: 20,
		overflow: 'hidden',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 6,
	},
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 18,
		paddingVertical: 16,
	},
	itemIconContainer: {
		width: 36,
		marginRight: 14,
	},
	itemInfo: {
		flex: 1,
	},
	itemLabel: {
		fontSize: 15,
		fontWeight: '700',
	},
	itemValue: {
		fontSize: 13,
		fontWeight: '500',
		opacity: 0.6,
		marginTop: 2,
	},
	socialSection: {
		marginBottom: 20,
	},
	socialCard: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		borderRadius: 20,
		paddingVertical: 20,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 6,
	},
	socialItem: {
		alignItems: 'center',
	},
	socialLabel: {
		fontSize: 12,
		fontWeight: '700',
		marginTop: 8,
	},
});
