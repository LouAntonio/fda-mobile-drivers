import React, { useState } from 'react';
import {
	View,
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
import Input from '../../components/Input';
import Button from '../../components/Button';
import { registerUser } from '../../services/auth';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';

type RegisterNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	'Register'
>;

export default function RegisterScreen() {
	const navigation = useNavigation<RegisterNavigationProp>();
	const { themeColors } = useThemeColors();

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const keyboardHeight = useKeyboardHeight();

	const mutation = useMutation({
		mutationFn: registerUser,
		onSuccess: () => {
			Alert.alert('Sucesso', 'Conta criada com sucesso!', [
				{
					text: 'OK',
					onPress: () => navigation.navigate('Login'),
				},
			]);
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao criar conta.',
			);
		},
	});

	const handleRegister = () => {
		if (
			!firstName ||
			!lastName ||
			!phone ||
			!password ||
			!confirmPassword
		) {
			Alert.alert('Erro', 'Por favor, preencha todos os campos.');
			return;
		}
		if (password.length < 6) {
			Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
			return;
		}
		if (password !== confirmPassword) {
			Alert.alert('Erro', 'As senhas não coincidem.');
			return;
		}
		mutation.mutate({
			name: firstName,
			surname: lastName,
			phoneNumber: phone,
			password,
		});
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
				style={styles.keyboardView}
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
						className="items-center mb-8"
					>
						<Image
							source={require('../../../assets/images/logo.png')}
							style={styles.logo}
							className="mb-4 rounded-3xl"
						/>
						<Text
							className="text-3xl font-black mb-2 text-center tracking-tighter"
							style={{ color: themeColors.text }}
						>
							CADASTRO
						</Text>
						<Text
							className="text-base text-center px-6"
							style={[
								styles.subtitle,
								{ color: themeColors.secondary },
							]}
						>
							Crie uma conta e peça uma corrida ou mande uma
							encomenda
						</Text>
					</Animated.View>

					<Animated.View entering={FadeInUp.duration(800).delay(400)}>
						<View className="flex-row gap-x-4">
							<View className="flex-1">
								<Input
									label="Nome"
									placeholder="Ex: João"
									value={firstName}
									onChangeText={setFirstName}
									leftIcon="person-outline"
								/>
							</View>
							<View className="flex-1">
								<Input
									label="Sobrenome"
									placeholder="Ex: Silva"
									value={lastName}
									onChangeText={setLastName}
									leftIcon="person-outline"
								/>
							</View>
						</View>

						<Input
							label="Telefone"
							placeholder="9XX XXX XXX"
							value={phone}
							onChangeText={setPhone}
							keyboardType="phone-pad"
							leftIcon="call-outline"
						/>

						<Input
							label="Senha"
							placeholder="Crie sua senha"
							value={password}
							onChangeText={setPassword}
							isPassword
							leftIcon="lock-closed-outline"
						/>

						<Input
							label="Confirmar Senha"
							placeholder="Repita sua senha"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							isPassword
							leftIcon="lock-closed-outline"
						/>

						<Button
							title="Criar minha conta"
							onPress={handleRegister}
							loading={mutation.isPending}
							className="mt-4 mb-8"
						/>

						<View className="flex-row items-center justify-center mt-12 mb-6">
							<Text
								style={[
									styles.footerText,
									{ color: themeColors.secondary },
								]}
							>
								Já tem conta?{' '}
							</Text>
							<TouchableOpacity
								onPress={() => navigation.goBack()}
							>
								<Text
									style={[
										styles.footerLink,
										{ color: themeColors.primary },
									]}
								>
									ENTRAR AGORA
								</Text>
							</TouchableOpacity>
						</View>
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
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		padding: 24,
		justifyContent: 'center',
	},
	logo: {
		width: 80,
		height: 80,
		resizeMode: 'contain',
	},
	subtitle: {
		opacity: 0.8,
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
