import React, { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	ActivityIndicator,
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
import { useVehicles, useCreateVehicle, useSetActiveVehicle, useDeleteVehicle } from '../../hooks/useVehicles';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import type { VehicleType } from '../../types/api';

const VEHICLE_TYPES: { label: string; value: VehicleType; icon: string }[] = [
	{ label: 'Mota', value: 'MOTO', icon: 'bicycle' },
	{ label: 'Carro', value: 'CARRO', icon: 'car' },
];

export default function DriverVehicleScreen() {
	const navigation = useNavigation();
	const { themeColors, isDark } = useThemeColors();
	const { data: vehicles, isLoading } = useVehicles();
	const { data: driverProfile } = useDriverProfile();
	const createMutation = useCreateVehicle();
	const setActiveMutation = useSetActiveVehicle();
	const deleteMutation = useDeleteVehicle();

	const [showAddModal, setShowAddModal] = useState(false);
	const [plateNumber, setPlateNumber] = useState('');
	const [brand, setBrand] = useState('');
	const [model, setModel] = useState('');
	const [color, setColor] = useState('');
	const [type, setType] = useState<VehicleType>('MOTO');

	const activeVehicleId = driverProfile?.activeVehicleId;

	const handleAddVehicle = () => {
		if (!plateNumber.trim() || !brand.trim() || !model.trim() || !color.trim()) {
			Alert.alert('Atenção', 'Preencha todos os campos');
			return;
		}
		createMutation.mutate(
			{ plateNumber, brand, model, color, type },
			{
				onSuccess: () => {
					setShowAddModal(false);
					setPlateNumber('');
					setBrand('');
					setModel('');
					setColor('');
				},
			},
		);
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.background }}>
			<View className="flex-row items-center justify-between px-5 py-3">
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
				>
					<Ionicons name="chevron-back" size={22} color={themeColors.text} />
				</TouchableOpacity>
				<Text className="text-xl font-bold tracking-tight" style={{ color: themeColors.text }}>
					Meu Veículo
				</Text>
				<TouchableOpacity
					onPress={() => setShowAddModal(true)}
					className="w-10 h-10 items-center justify-center rounded-full bg-primary/10"
				>
					<Ionicons name="add" size={24} color={themeColors.primary} />
				</TouchableOpacity>
			</View>

			<ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
				{isLoading ? (
					<View className="items-center py-20">
						<ActivityIndicator size="large" color={themeColors.primary} />
					</View>
				) : vehicles && vehicles.length > 0 ? (
					<Animated.View entering={FadeInDown.duration(600)} className="mt-4">
						{vehicles.map((vehicle, index) => {
							const isActive = vehicle.id === activeVehicleId;
							return (
								<Animated.View
									key={vehicle.id}
									entering={FadeInRight.duration(500).delay(index * 60)}
								>
									<View
										className="p-5 rounded-2xl mb-4"
										style={{
											backgroundColor: isDark ? '#1A1A1A' : '#FFF',
											borderWidth: isActive ? 2 : 1,
											borderColor: isActive ? themeColors.primary : (isDark ? '#333' : '#E5E7EB'),
											elevation: 3,
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 3 },
											shadowOpacity: 0.06,
											shadowRadius: 8,
										}}
									>
										<View className="flex-row items-center">
											<View className="w-14 h-14 rounded-2xl items-center justify-center bg-primary/20">
												<Ionicons
													name={vehicle.type === 'MOTO' ? 'bicycle' : 'car'}
													size={32}
													color={themeColors.primary}
												/>
											</View>
											<View className="flex-1 ml-4">
												<Text className="text-lg font-black" style={{ color: themeColors.text }}>
													{vehicle.brand} {vehicle.model}
												</Text>
												<Text className="text-sm font-semibold text-gray-500 mt-0.5">
													{vehicle.plateNumber} • {vehicle.color}
												</Text>
												<View className="flex-row items-center mt-1 gap-2">
													<View className={`px-2 py-0.5 rounded-lg ${vehicle.status === 'ACTIVE' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
														<Text className={`text-xs font-bold ${vehicle.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>
															{vehicle.status === 'ACTIVE' ? 'Ativo' : vehicle.status === 'PENDING' ? 'Pendente' : vehicle.status === 'BLOCKED' ? 'Bloqueado' : 'Manutenção'}
														</Text>
													</View>
													{isActive && (
														<View className="px-2 py-0.5 rounded-lg bg-primary/20">
															<Text className="text-xs font-bold text-primary">Atual</Text>
														</View>
													)}
												</View>
											</View>
										</View>

										{!isActive && vehicle.status === 'ACTIVE' && (
											<TouchableOpacity
												onPress={() => setActiveMutation.mutate(vehicle.id)}
												className="mt-4 py-3 rounded-xl items-center border"
												style={{ borderColor: themeColors.primary }}
												disabled={setActiveMutation.isPending}
											>
												<Text className="text-sm font-bold" style={{ color: themeColors.primary }}>
													Definir como Ativo
												</Text>
											</TouchableOpacity>
										)}

										{!isActive && (
											<TouchableOpacity
												onPress={() => {
													Alert.alert('Remover Veículo', 'Tem certeza?', [
														{ text: 'Cancelar', style: 'cancel' },
														{ text: 'Remover', style: 'destructive', onPress: () => deleteMutation.mutate(vehicle.id) },
													]);
												}}
												className="mt-2 py-2 rounded-xl items-center"
											>
												<Text className="text-xs font-bold text-red-500">Remover</Text>
											</TouchableOpacity>
										)}
									</View>
								</Animated.View>
							);
						})}
					</Animated.View>
				) : (
					<View className="items-center py-20">
						<View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
							<Ionicons name="car-outline" size={40} color={themeColors.primary} />
						</View>
						<Text className="text-lg font-bold" style={{ color: themeColors.text }}>
							Nenhum veículo cadastrado
						</Text>
						<Text className="text-sm mt-2 text-gray-500 text-center">
							Adicione um veículo para começar a fazer viagens
						</Text>
						<TouchableOpacity
							onPress={() => setShowAddModal(true)}
							className="mt-6 py-3 px-8 rounded-2xl bg-primary"
						>
							<Text className="text-base font-black text-secondary">Adicionar Veículo</Text>
						</TouchableOpacity>
					</View>
				)}
			</ScrollView>

			<Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end">
					<Pressable className="absolute inset-0 bg-black/50" onPress={() => setShowAddModal(false)} />
					<View className={`rounded-t-3xl p-6 pb-10 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
						<View className="flex-row items-center justify-between mb-6">
							<Text className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
								Adicionar Veículo
							</Text>
							<TouchableOpacity
								onPress={() => setShowAddModal(false)}
								className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"
							>
								<Ionicons name="close" size={20} color={isDark ? '#FFF' : '#000'} />
							</TouchableOpacity>
						</View>

						<Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Tipo de Veículo</Text>
						<View className="flex-row gap-3 mb-5">
							{VEHICLE_TYPES.map((opt) => {
								const isActive = type === opt.value;
								return (
									<TouchableOpacity
										key={opt.value}
										onPress={() => setType(opt.value)}
										className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-xl gap-1 ${isActive ? 'bg-primary' : isDark ? 'bg-[#262626]' : 'bg-gray-100'}`}
									>
										<Ionicons name={opt.icon as any} size={16} color={isActive ? '#231F20' : themeColors.text} />
										<Text className={`text-xs font-bold ${isActive ? 'text-secondary' : 'text-gray-500 dark:text-gray-400'}`}>{opt.label}</Text>
									</TouchableOpacity>
								);
							})}
						</View>

						<View className="px-4 py-3 rounded-2xl border mb-3" style={{ backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB', borderColor: isDark ? '#333' : '#E5E7EB' }}>
							<TextInput className="text-base" style={{ color: themeColors.text }} placeholder="Placa (ex: LD-45-12-AA)" placeholderTextColor="#9CA3AF" value={plateNumber} onChangeText={setPlateNumber} autoCapitalize="characters" />
						</View>
						<View className="flex-row gap-3 mb-3">
							<View className="flex-1 px-4 py-3 rounded-2xl border" style={{ backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB', borderColor: isDark ? '#333' : '#E5E7EB' }}>
								<TextInput className="text-base" style={{ color: themeColors.text }} placeholder="Marca" placeholderTextColor="#9CA3AF" value={brand} onChangeText={setBrand} />
							</View>
							<View className="flex-1 px-4 py-3 rounded-2xl border" style={{ backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB', borderColor: isDark ? '#333' : '#E5E7EB' }}>
								<TextInput className="text-base" style={{ color: themeColors.text }} placeholder="Modelo" placeholderTextColor="#9CA3AF" value={model} onChangeText={setModel} />
							</View>
						</View>
						<View className="px-4 py-3 rounded-2xl border mb-5" style={{ backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB', borderColor: isDark ? '#333' : '#E5E7EB' }}>
							<TextInput className="text-base" style={{ color: themeColors.text }} placeholder="Cor" placeholderTextColor="#9CA3AF" value={color} onChangeText={setColor} />
						</View>

						<TouchableOpacity
							onPress={handleAddVehicle}
							className="py-4 rounded-2xl items-center bg-primary"
							disabled={createMutation.isPending}
						>
							{createMutation.isPending ? (
								<ActivityIndicator color="#000" />
							) : (
								<Text className="text-base font-black text-secondary">Cadastrar</Text>
							)}
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}
