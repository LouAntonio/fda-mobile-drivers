import React, { useState } from 'react';
import {
	Text,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Alert,
	Image,
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
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { loginUser } from '../../services/auth';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';

type LoginNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	'Login'
>;

export default function LoginScreen() {
	const navigation = useNavigation<LoginNavigationProp>();
	const { themeColors } = useThemeColors();
	const setAuth = useAuthStore((state) => state.setAuth);
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const keyboardHeight = useKeyboardHeight();

	const mutation = useMutation({
		mutationFn: loginUser,
		onSuccess: (res) => {
			const data = res.data as unknown as {
				accessToken: string;
				refreshToken: string;
				user: import('../../store/authStore').User;
			};
			setAuth(data.user, data.accessToken, data.refreshToken);
			// @ts-ignore - Main is in RootStackParamList
			navigation.replace('Main');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao fazer login.',
			);
		},
	});

	const handleLogin = () => {
		if (!phone || !password) {
			Alert.alert('Erro', 'Preencha todos os campos.');
			return;
		}
		mutation.mutate({ phoneNumber: phone, password });
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
					showsVerticalScrollIndicator={false}
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
							className="text-4xl font-black mb-2 tracking-tighter"
							style={{ color: themeColors.text }}
						>
							LOGIN
						</Text>
						<Text
							className="text-lg font-medium text-center px-4"
							style={[
								styles.subtitle,
								{ color: themeColors.secondary },
							]}
						>
							Bem-vindo de volta! Faça login para continuar.
						</Text>
					</Animated.View>

					<Animated.View entering={FadeInUp.duration(800).delay(400)}>
						<Input
							label="Telefone"
							placeholder="9XX XXX XXX"
							value={phone}
							onChangeText={setPhone}
							keyboardType="phone-pad"
							autoCapitalize="none"
							leftIcon="call-outline"
						/>

						<Input
							label="Senha"
							placeholder="Sua senha secreta"
							value={password}
							onChangeText={setPassword}
							isPassword
							leftIcon="lock-closed-outline"
						/>

						<TouchableOpacity
							onPress={() =>
								navigation.navigate('ForgotPassword')
							}
							className="self-end mb-8"
							activeOpacity={0.6}
						>
							<Text
								style={[
									styles.forgotPassword,
									{ color: themeColors.primary },
								]}
							>
								ESQUECEU A SENHA?
							</Text>
						</TouchableOpacity>

						<Button
							title="Entrar na conta"
							onPress={handleLogin}
							loading={mutation.isPending}
							className="mb-8"
						/>
					</Animated.View>

					<Animated.View
						entering={FadeInUp.duration(800).delay(750)}
						className="flex-row items-center justify-center mt-8 mb-6"
					>
						<Text
							style={[
								styles.footerText,
								{ color: themeColors.secondary },
							]}
						>
							Novo por aqui?{' '}
						</Text>
						<TouchableOpacity
							onPress={() => navigation.navigate('Register')}
						>
							<Text
								style={[
									styles.footerLink,
									{ color: themeColors.primary },
								]}
							>
								CRIAR CONTA AGORA
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
		width: 120,
		height: 120,
		resizeMode: 'contain',
	},
	subtitle: {
		opacity: 0.8,
	},
	forgotPassword: {
		fontWeight: '800',
		fontSize: 13,
	},
	dividerLine: {
		opacity: 0.3,
	},
	dividerText: {
		opacity: 0.5,
	},
	footerText: {
		fontWeight: '500',
	},
	footerLink: {
		fontWeight: '900',
	},
});
