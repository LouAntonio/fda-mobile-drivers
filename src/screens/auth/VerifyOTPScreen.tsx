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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { AuthStackParamList } from '../../types/navigation';
import { useThemeColors } from '../../hooks/useThemeColors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { forgotPassword } from '../../services/auth';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';

type VerifyTokenNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	'VerifyToken'
>;
type VerifyTokenRouteProp = RouteProp<AuthStackParamList, 'VerifyToken'>;

export default function VerifyTokenScreen() {
	const navigation = useNavigation<VerifyTokenNavigationProp>();
	const route = useRoute<VerifyTokenRouteProp>();
	const { email } = route.params;
	const { themeColors } = useThemeColors();

	const [token, setToken] = useState('');
	const keyboardHeight = useKeyboardHeight();

	const resendMutation = useMutation({
		mutationFn: forgotPassword,
		onSuccess: () => {
			Alert.alert(
				'Sucesso',
				'Um novo link de recuperação foi enviado para o seu email.',
			);
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao reenviar link.',
			);
		},
	});

	const handleVerify = () => {
		if (!token.trim()) {
			Alert.alert('Erro', 'Por favor, insira o token de recuperação.');
			return;
		}
		navigation.navigate('ResetPassword', { token: token.trim() });
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
							VERIFICAR TOKEN
						</Text>
						<Text
							className="text-base text-center px-4"
							style={[
								styles.description,
								{ color: themeColors.secondary },
							]}
						>
							Enviamos um link de recuperação para {email}. Insira
							abaixo o token recebido para continuar.
						</Text>
					</Animated.View>

					<Animated.View entering={FadeInUp.duration(800).delay(400)}>
						<Input
							label="Token de Recuperação"
							placeholder="Cole o token recebido no email"
							value={token}
							onChangeText={setToken}
							autoCapitalize="none"
							leftIcon="key-outline"
						/>

						<Button
							title="Verificar Token"
							onPress={handleVerify}
							className="mt-4 mb-8"
						/>

						<TouchableOpacity
							onPress={() => resendMutation.mutate({ email })}
							className="items-center py-2"
							activeOpacity={0.6}
						>
							<Text
								style={[
									styles.resendText,
									{ color: themeColors.secondary },
								]}
							>
								Não recebeu o token?{' '}
								<Text
									style={[
										styles.resendLink,
										{ color: themeColors.primary },
									]}
								>
									REENVIAR
								</Text>
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => navigation.goBack()}
							className="items-center py-6"
							activeOpacity={0.6}
						>
							<Text
								style={[
									styles.backText,
									{ color: themeColors.primary },
								]}
							>
								VOLTAR
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
	resendText: {
		fontWeight: '600',
	},
	resendLink: {
		fontWeight: '900',
	},
	backText: {
		fontWeight: '900',
		letterSpacing: 1,
	},
});
