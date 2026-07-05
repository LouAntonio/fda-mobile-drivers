import React, { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Linking,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
	TouchableWithoutFeedback,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useMutation } from '@tanstack/react-query';
import { sendContactMessage } from '../../api/support';

const SUPPORT_CHANNELS = [
	{
		icon: 'logo-whatsapp',
		label: 'WhatsApp',
		value: '+244 923 456 789',
		color: '#25D366',
	},
	{
		icon: 'call',
		label: 'Telefone',
		value: '+244 222 123 456',
		color: '#007AFF',
	},
	{
		icon: 'mail',
		label: 'E-mail',
		value: 'suporte@flashdelivery.co.ao',
		color: '#EA4335',
	},
];

const FAQ_ITEMS = [
	{
		question: 'Como solicitar uma corrida?',
		answer: 'Insira o destino na barra de pesquisa na tela inicial, selecione o tipo de serviço e confirme.',
	},
	{
		question: 'Quais formas de pagamento são aceitas?',
		answer: 'Multicaixa Express, dinheiro, cartão de crédito/débito e Flash Wallet.',
	},
	{
		question: 'Como cancelo uma corrida?',
		answer: 'Toque na corrida ativa e selecione "Cancelar". Cancelamentos após 2 minutos podem ter taxa.',
	},
	{
		question: 'Como uso um cupão de desconto?',
		answer: 'Vá em Promoções no menu lateral, copie o código e cole na tela de pagamento.',
	},
];

export default function ContactScreen() {
	const navigation = useNavigation();
	const { themeColors, isDark } = useThemeColors();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [message, setMessage] = useState('');
	const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

	const cardBgStyle = {
		backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
	};

	const contactMutation = useMutation({
		mutationFn: sendContactMessage,
		onSuccess: () => {
			Alert.alert(
				'Mensagem Enviada',
				'Recebemos sua mensagem e responderemos em breve.',
			);
			setName('');
			setEmail('');
			setPhone('');
			setMessage('');
		},
		onError: () => {
			Alert.alert(
				'Erro',
				'Não foi possível enviar a mensagem. Tenta novamente mais tarde.',
			);
		},
	});

	const handleSend = () => {
		if (!name || !message) {
			Alert.alert('Atenção', 'Preenche o nome e a mensagem.');
			return;
		}
		contactMutation.mutate({
			name,
			email: email || undefined,
			phone: phone || undefined,
			message,
		});
	};

	const handleContact = (channel: string) => {
		switch (channel) {
			case 'WhatsApp':
				Linking.openURL('https://wa.me/244923456789');
				break;
			case 'Telefone':
				Linking.openURL('tel:+244222123456');
				break;
			case 'E-mail':
				Linking.openURL('mailto:suporte@flashdelivery.co.ao');
				break;
		}
	};

	return (
		<SafeAreaView
			style={[
				styles.container,
				{ backgroundColor: themeColors.background },
			]}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				// eslint-disable-next-line react-native/no-inline-styles
				style={{ flex: 1 }}
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
					<Text
						style={[
							styles.headerTitle,
							{ color: themeColors.text },
						]}
					>
						Fale Conosco
					</Text>
					<View style={styles.placeholder} />
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View>
							{/* Contact Channels */}
							<Animated.View entering={FadeInDown.duration(600)}>
								<Text
									style={[
										styles.sectionTitle,
										{ color: themeColors.text },
									]}
								>
									Canais de Suporte
								</Text>
								<View style={styles.channelsGrid}>
									{SUPPORT_CHANNELS.map((channel, index) => (
										<Animated.View
											key={channel.label}
											entering={FadeInRight.duration(
												500,
											).delay(index * 100)}
											style={styles.channelGridItem}
										>
											<TouchableOpacity
												style={[
													styles.channelCard,
													cardBgStyle,
													{
														borderColor:
															channel.color +
															'30',
													},
												]}
												onPress={() =>
													handleContact(channel.label)
												}
												activeOpacity={0.7}
											>
												<View
													style={[
														styles.channelIcon,
														{
															backgroundColor:
																channel.color +
																'15',
														},
													]}
												>
													<Ionicons
														name={
															channel.icon as any
														}
														size={24}
														color={channel.color}
													/>
												</View>
												<Text
													style={[
														styles.channelLabel,
														{
															color: themeColors.text,
														},
													]}
												>
													{channel.label}
												</Text>
												<Text
													style={[
														styles.channelValue,
														{
															color:
																themeColors.text +
																'80',
														},
													]}
													numberOfLines={1}
												>
													{channel.value}
												</Text>
											</TouchableOpacity>
										</Animated.View>
									))}
								</View>
							</Animated.View>

							{/* FAQ */}
							<Animated.View
								entering={FadeInDown.duration(600).delay(300)}
								style={styles.faqSection}
							>
								<Text
									style={[
										styles.sectionTitle,
										{ color: themeColors.text },
									]}
								>
									Perguntas Frequentes
								</Text>
								{FAQ_ITEMS.map((faq, index) => {
									const isExpanded = expandedFaq === index;
									return (
										<Animated.View
											key={index}
											entering={FadeInRight.duration(
												500,
											).delay(index * 80)}
										>
											<TouchableOpacity
												style={[
													styles.faqCard,
													cardBgStyle,
													// eslint-disable-next-line react-native/no-inline-styles
													isExpanded && {
														borderColor:
															themeColors.primary +
															'40',
														borderWidth: 1.5,
													},
												]}
												onPress={() =>
													setExpandedFaq(
														isExpanded
															? null
															: index,
													)
												}
												activeOpacity={0.7}
											>
												<View style={styles.faqHeader}>
													<Text
														style={[
															styles.faqQuestion,
															{
																color: themeColors.text,
															},
															isExpanded && {
																color: themeColors.primary,
															},
														]}
													>
														{faq.question}
													</Text>
													<View
														style={[
															styles.faqIconContainer,
															// eslint-disable-next-line react-native/no-inline-styles
															{
																backgroundColor:
																	isExpanded
																		? themeColors.primary
																		: 'transparent',
															},
														]}
													>
														<Ionicons
															name={
																isExpanded
																	? 'remove'
																	: 'add'
															}
															size={20}
															color={
																isExpanded
																	? '#000'
																	: themeColors.primary
															}
														/>
													</View>
												</View>
												{isExpanded && (
													<Animated.View
														entering={FadeInDown.duration(
															300,
														)}
													>
														<Text
															style={[
																styles.faqAnswer,
																{
																	color:
																		themeColors.text +
																		'90',
																},
															]}
														>
															{faq.answer}
														</Text>
													</Animated.View>
												)}
											</TouchableOpacity>
										</Animated.View>
									);
								})}
							</Animated.View>

							{/* Contact Form */}
							<Animated.View
								entering={FadeInDown.duration(600).delay(600)}
								style={styles.formSection}
							>
								<Text
									style={[
										styles.sectionTitle,
										{ color: themeColors.text },
									]}
								>
									Envie uma Mensagem
								</Text>
								<View style={[styles.formCard, cardBgStyle]}>
									<Input
										label="Nome"
										value={name}
										onChangeText={setName}
										placeholder="Seu nome completo"
										leftIcon="person-outline"
									/>
									<Input
										label="E-mail"
										value={email}
										onChangeText={setEmail}
										placeholder="seu@email.com"
										keyboardType="email-address"
										autoCapitalize="none"
										leftIcon="mail-outline"
									/>
									<Input
										label="Telefone"
										value={phone}
										onChangeText={setPhone}
										placeholder="+244 9xx xxx xxx"
										keyboardType="phone-pad"
										leftIcon="call-outline"
									/>
									<Input
										label="Mensagem"
										value={message}
										onChangeText={setMessage}
										placeholder="Descreva sua dúvida ou problema..."
										multiline
										numberOfLines={5}
										leftIcon="chatbox-outline"
									/>
									<Button
										title={
											contactMutation.isPending
												? 'A enviar...'
												: 'Enviar Mensagem'
										}
										onPress={handleSend}
										className="mt-2"
										disabled={contactMutation.isPending}
									/>
								</View>
							</Animated.View>
						</View>
					</TouchableWithoutFeedback>
				</ScrollView>
			</KeyboardAvoidingView>
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
	sectionTitle: {
		fontSize: 18,
		fontWeight: '900',
		marginBottom: 16,
		letterSpacing: -0.5,
	},
	channelsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginHorizontal: -6,
		marginBottom: 20,
	},
	channelGridItem: {
		width: '33.33%',
		paddingHorizontal: 6,
	},
	channelCard: {
		alignItems: 'center',
		paddingVertical: 18,
		paddingHorizontal: 8,
		borderRadius: 22,
		marginBottom: 12,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 10,
		borderWidth: 1,
		borderColor: 'transparent',
	},
	channelIcon: {
		width: 48,
		height: 48,
		borderRadius: 15,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
	},
	channelLabel: {
		fontSize: 13,
		fontWeight: '800',
		textAlign: 'center',
	},
	channelValue: {
		fontSize: 10,
		fontWeight: '600',
		marginTop: 4,
		textAlign: 'center',
	},
	faqSection: {
		marginBottom: 32,
	},
	faqCard: {
		padding: 20,
		borderRadius: 22,
		marginBottom: 12,
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		borderWidth: 1.5,
		borderColor: 'transparent',
	},
	faqHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	faqQuestion: {
		flex: 1,
		fontSize: 16,
		fontWeight: '800',
		paddingRight: 12,
		lineHeight: 22,
	},
	faqIconContainer: {
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: 'center',
		alignItems: 'center',
	},
	faqAnswer: {
		fontSize: 14,
		fontWeight: '500',
		lineHeight: 22,
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: 'rgba(128, 128, 128, 0.2)',
	},
	formSection: {
		marginBottom: 40,
	},
	formCard: {
		padding: 24,
		borderRadius: 28,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
	},
});
