import React, { useState } from 'react';
import {
	Text,
	TouchableOpacity,
	Alert,
	Image,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { AuthStackParamList } from '../../types/navigation';
import { useThemeColors } from '../../hooks/useThemeColors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { forgotPassword } from '../../services/auth';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	'ForgotPassword'
>;

export default function ForgotPasswordScreen() {
	const navigation = useNavigation<ForgotPasswordNavigationProp>();
	const { themeColors } = useThemeColors();

	const [phoneNumber, setPhoneNumber] = useState('');
	const keyboardHeight = useKeyboardHeight();

	const mutation = useMutation({
		mutationFn: forgotPassword,
		onSuccess: () => {
			Alert.alert(
				'Sucesso',
				'Se o número existir, você receberá um código de recuperação.',
				[
					{
						text: 'OK',
						onPress: () =>
							navigation.navigate('VerifyToken', {
								phoneNumber,
							}),
					},
				],
			);
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg ||
					'Erro ao enviar código de recuperação.',
			);
		},
	});

	const handleSend = () => {
		if (!phoneNumber) {
			Alert.alert('Erro', 'Por favor, insira o seu número de telefone.');
			return;
		}
		mutation.mutate({ phoneNumber });
	};

	return (
		<SafeAreaView
			style={[
				styles.safeArea,
				{ backgroundColor: themeColors.background },
			]}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={[
						styles.scrollContent,
						{ paddingBottom: Math.max(keyboardHeight, 24) },
					]}
					keyboardShouldPersistTaps="handled"
				>
					<Animated.View
						entering={FadeInDown.duration(800).delay(200)}
						className="items-center mb-10"
					>
						<Image
							source={require('../../../assets/images/logo.png')}
							style={styles.logo}
							className="mb-6 rounded-3xl"
						/>
						<Text
							className="text-3xl font-black mb-4 text-center tracking-tighter"
							style={{ color: themeColors.text }}
						>
							RECUPERAR ACESSO
						</Text>
						<Text
							className="text-base text-center px-4"
							style={[
								styles.description,
								{ color: themeColors.secondary },
							]}
						>
							Informe o seu número de telefone para
							receber um código de recuperação.
						</Text>
					</Animated.View>

					<Animated.View entering={FadeInUp.duration(800).delay(400)}>
						<Input
							label="Número de Telefone"
							placeholder="+244 900 000 000"
							value={phoneNumber}
							onChangeText={setPhoneNumber}
							keyboardType="phone-pad"
							autoCapitalize="none"
							leftIcon="phone-portrait-outline"
						/>

						<Button
							title="Enviar Código de Recuperação"
							onPress={handleSend}
							loading={mutation.isPending}
							className="mt-4 mb-8"
						/>

						<TouchableOpacity
							onPress={() => navigation.goBack()}
							className="items-center py-4"
							activeOpacity={0.6}
						>
							<Text
								style={[
									styles.backText,
									{ color: themeColors.primary },
								]}
							>
								VOLTAR PARA LOGIN
							</Text>
						</TouchableOpacity>
					</Animated.View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	flex: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		padding: 24,
		justifyContent: 'center',
	},
	logo: {
		width: 100,
		height: 100,
		resizeMode: 'contain',
	},
	description: {
		lineHeight: 22,
		opacity: 0.8,
	},
	backText: {
		fontWeight: '900',
		letterSpacing: 1,
	},
});
