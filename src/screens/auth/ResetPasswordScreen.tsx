import React, { useState } from 'react';
import {
	Text,
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
import { resetPassword } from '../../services/auth';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';

type ResetPasswordNavigationProp = NativeStackNavigationProp<
	AuthStackParamList,
	'ResetPassword'
>;

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
	const navigation = useNavigation<ResetPasswordNavigationProp>();
	const route = useRoute<ResetPasswordRouteProp>();
	const { token } = route.params;
	const { themeColors } = useThemeColors();

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const keyboardHeight = useKeyboardHeight();

	const mutation = useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			Alert.alert('Sucesso', 'Sua senha foi atualizada com sucesso!', [
				{
					text: 'OK',
					onPress: () => navigation.navigate('Login'),
				},
			]);
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert(
				'Erro',
				err.response?.data?.msg || 'Erro ao redefinir senha.',
			);
		},
	});

	const handleReset = () => {
		if (password.length < 6) {
			Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
			return;
		}
		if (password !== confirmPassword) {
			Alert.alert('Erro', 'As senhas não coincidem.');
			return;
		}
		mutation.mutate({ token, password });
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
							NOVA SENHA
						</Text>
						<Text
							className="text-base text-center px-4"
							style={[
								styles.description,
								{ color: themeColors.secondary },
							]}
						>
							Crie uma nova senha segura para o seu acesso.
						</Text>
					</Animated.View>

					<Animated.View entering={FadeInUp.duration(800).delay(400)}>
						<Input
							label="Nova Senha"
							placeholder="Mínimo de 8 caracteres"
							value={password}
							onChangeText={setPassword}
							isPassword
							leftIcon="lock-closed-outline"
						/>

						<Input
							label="Confirmar Senha"
							placeholder="Confirme a nova senha"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							isPassword
							leftIcon="lock-closed-outline"
						/>

						<Button
							title="Atualizar Senha"
							onPress={handleReset}
							loading={mutation.isPending}
							className="mt-4 mb-8"
						/>
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
});
