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
	Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import {
	useVehicles,
	useCreateVehicle,
	useUpdateVehicle,
	useSetActiveVehicle,
	useDeleteVehicle,
} from '../../hooks/useVehicles';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import { uploadToCloudinary } from '../../lib/upload';
import type { VehicleType, VehicleItem } from '../../types/api';

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
	const updateMutation = useUpdateVehicle();
	const setActiveMutation = useSetActiveVehicle();
	const deleteMutation = useDeleteVehicle();

	const [showAddModal, setShowAddModal] = useState(false);
	const [plateNumber, setPlateNumber] = useState('');
	const [brand, setBrand] = useState('');
	const [model, setModel] = useState('');
	const [year, setYear] = useState('');
	const [color, setColor] = useState('');
	const [type, setType] = useState<VehicleType>('MOTO');

	const [showEditModal, setShowEditModal] = useState(false);
	const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(
		null,
	);

	const [photoUrl, setPhotoUrl] = useState('');
	const [uploadingPhoto, setUploadingPhoto] = useState(false);

	const pickVehiclePhoto = async () => {
		const permission =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			Alert.alert(
				'Permissão',
				'É necessário permitir o acesso à galeria',
			);
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			quality: 0.8,
		});
		if (result.canceled) return;
		setUploadingPhoto(true);
		try {
			const url = await uploadToCloudinary(
				result.assets[0].uri,
				'vehicles',
			);
			setPhotoUrl(url);
		} catch {
			Alert.alert('Erro', 'Falha ao carregar foto');
		} finally {
			setUploadingPhoto(false);
		}
	};

	const activeVehicleId = driverProfile?.activeVehicleId;

	const handleAddVehicle = () => {
		if (
			!plateNumber.trim() ||
			!brand.trim() ||
			!model.trim() ||
			!year.trim() ||
			!color.trim()
		) {
			Alert.alert('Atenção', 'Preencha todos os campos');
			return;
		}
		const yearNum = parseInt(year, 10);
		if (yearNum < 1990 || yearNum > new Date().getFullYear() + 1) {
			Alert.alert('Erro', 'Ano inválido. Insira um ano entre 1990 e ' + (new Date().getFullYear() + 1));
			return;
		}
		createMutation.mutate(
			{
				plateNumber,
				brand,
				model,
				year: yearNum,
				color,
				type,
				photoUrl: photoUrl || undefined,
			},
			{
				onSuccess: () => {
					setShowAddModal(false);
					setPlateNumber('');
					setBrand('');
					setModel('');
					setColor('');
					setYear('');
					setPhotoUrl('');
				},
			},
		);
	};

	const handleEditVehicle = () => {
		if (!editingVehicle) return;
		if (
			!plateNumber.trim() ||
			!brand.trim() ||
			!model.trim() ||
			!year.trim() ||
			!color.trim()
		) {
			Alert.alert('Atenção', 'Preencha todos os campos');
			return;
		}
		const yearNum = parseInt(year, 10);
		if (yearNum < 1990 || yearNum > new Date().getFullYear() + 1) {
			Alert.alert('Erro', 'Ano inválido. Insira um ano entre 1990 e ' + (new Date().getFullYear() + 1));
			return;
		}
		updateMutation.mutate(
			{
				id: editingVehicle.id,
				payload: {
					plateNumber,
					brand,
					model,
					year: yearNum,
					color,
					type,
					photoUrl: photoUrl || undefined,
				},
			},
			{
				onSuccess: () => {
					setShowEditModal(false);
					setEditingVehicle(null);
				},
			},
		);
	};

	const openEditModal = (vehicle: VehicleItem) => {
		setEditingVehicle(vehicle);
		setPlateNumber(vehicle.plateNumber);
		setBrand(vehicle.brand);
		setModel(vehicle.model);
		setYear(vehicle.year?.toString() ?? '');
		setColor(vehicle.color);
		setType(vehicle.type);
		setPhotoUrl(vehicle.photoUrl ?? '');
		setShowEditModal(true);
	};

	return (
		<SafeAreaView className="flex-1 bg-off-white dark:bg-[#090909]">
			{/* Header */}
			<View className="flex-row items-center justify-between px-5 py-3">
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className="w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
				>
					<Ionicons
						name="chevron-back"
						size={22}
						color={themeColors.text}
					/>
				</TouchableOpacity>
				<Text className="text-lg font-black text-secondary dark:text-off-white">
					Meu Veículo
				</Text>
				<TouchableOpacity
					onPress={() => setShowAddModal(true)}
					className="w-10 h-10 items-center justify-center rounded-full bg-primary/10"
				>
					<Ionicons
						name="add"
						size={24}
						color={themeColors.primary}
					/>
				</TouchableOpacity>
			</View>

			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
			>
				{isLoading ? (
					<View className="pt-10 gap-4">
						{[1, 2].map((i) => (
							<View
								key={i}
								className="h-32 rounded-2xl bg-gray-200 dark:bg-[#1A1A1A]"
							/>
						))}
					</View>
				) : vehicles && vehicles.length > 0 ? (
					<Animated.View
						entering={FadeInDown.duration(600)}
						className="mt-4"
					>
						{vehicles.map((vehicle, index) => {
							const isActive = vehicle.id === activeVehicleId;
							return (
								<Animated.View
									key={vehicle.id}
									entering={FadeInRight.duration(500).delay(
										index * 60,
									)}
								>
									<View
										className="p-5 rounded-2xl mb-4"
										style={{
											backgroundColor: isDark
												? '#1A1A1A'
												: '#FFF',
											borderWidth: isActive ? 2 : 1,
											borderColor: isActive
												? themeColors.primary
												: isDark
													? '#333'
													: '#E5E7EB',
											elevation: isActive ? 6 : 2,
											shadowColor: isActive
												? themeColors.primary
												: '#000',
											shadowOffset: {
												width: 0,
												height: isActive ? 4 : 2,
											},
											shadowOpacity: isActive
												? 0.2
												: 0.05,
											shadowRadius: isActive ? 12 : 8,
										}}
									>
										<View className="flex-row items-center">
											<View className="w-14 h-14 rounded-2xl items-center justify-center bg-primary/20">
												<Ionicons
													name={
														vehicle.type === 'MOTO'
															? 'bicycle'
															: 'car'
													}
													size={32}
													color={themeColors.primary}
												/>
											</View>
											<View className="flex-1 ml-4">
												<Text className="text-lg font-black text-secondary dark:text-off-white">
													{vehicle.brand}{' '}
													{vehicle.model}
												</Text>
												<Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-0.5">
													{vehicle.plateNumber} •{' '}
													{vehicle.color}
												</Text>
												<View className="flex-row items-center mt-2 gap-2">
													<View
														className={`px-2.5 py-1 rounded-lg ${isActive ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}
													>
														<Text
															className={`text-[10px] font-black ${isActive ? 'text-green-600' : 'text-yellow-600'}`}
														>
															{vehicle.status ===
															'ACTIVE'
																? 'Ativo'
																: vehicle.status ===
																	  'PENDING'
																	? 'Pendente'
																	: vehicle.status ===
																		  'BLOCKED'
																		? 'Bloqueado'
																		: 'Manutenção'}
														</Text>
													</View>
													{isActive && (
														<View className="px-2.5 py-1 rounded-lg bg-primary/20">
															<Text className="text-[10px] font-black text-primary">
																Atual
															</Text>
														</View>
													)}
												</View>
											</View>
										</View>

										{!isActive &&
											vehicle.status === 'ACTIVE' && (
												<TouchableOpacity
													onPress={() =>
														setActiveMutation.mutate(
															vehicle.id,
														)
													}
													className="mt-4 py-3.5 rounded-2xl items-center border-2 active:opacity-70"
													style={{
														borderColor:
															themeColors.primary,
													}}
													disabled={
														setActiveMutation.isPending
													}
												>
													{setActiveMutation.isPending ? (
														<ActivityIndicator
															color={
																themeColors.primary
															}
														/>
													) : (
														<Text className="text-sm font-black text-primary">
															Definir como Ativo
														</Text>
													)}
												</TouchableOpacity>
											)}

										{!isActive && (
											<View className="flex-row gap-2 mt-2">
												<TouchableOpacity
													onPress={() =>
														openEditModal(vehicle)
													}
													className="flex-1 py-2 rounded-xl items-center border"
													style={{
														borderColor: isDark
															? '#333'
															: '#E5E7EB',
													}}
												>
													<Text className="text-xs font-black text-primary">
														Editar
													</Text>
												</TouchableOpacity>
												<TouchableOpacity
													onPress={() => {
														Alert.alert(
															'Remover Veículo',
															'Tem certeza?',
															[
																{
																	text: 'Cancelar',
																	style: 'cancel',
																},
																{
																	text: 'Remover',
																	style: 'destructive',
																	onPress:
																		() =>
																			deleteMutation.mutate(
																				vehicle.id,
																			),
																},
															],
														);
													}}
													className="flex-1 py-2 rounded-xl items-center"
												>
													<Text className="text-xs font-black text-red-500">
														Remover
													</Text>
												</TouchableOpacity>
											</View>
										)}
									</View>
								</Animated.View>
							);
						})}
					</Animated.View>
				) : (
					<Animated.View
						entering={FadeInDown.duration(600)}
						className="items-center pt-20"
					>
						<View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
							<Ionicons
								name="car-outline"
								size={40}
								color={themeColors.primary}
							/>
						</View>
						<Text className="text-lg font-black text-secondary dark:text-off-white">
							Nenhum veículo cadastrado
						</Text>
						<Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 text-center">
							Adicione um veículo para começar
						</Text>
						<TouchableOpacity
							onPress={() => setShowAddModal(true)}
							className="mt-6 py-3.5 px-8 rounded-2xl bg-primary active:opacity-70"
						>
							<Text className="text-base font-black text-secondary">
								Adicionar Veículo
							</Text>
						</TouchableOpacity>
					</Animated.View>
				)}
			</ScrollView>

			{/* Add Modal */}
			<Modal
				visible={showAddModal}
				animationType="slide"
				transparent
				onRequestClose={() => setShowAddModal(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1 justify-end"
				>
					<Pressable
						className="absolute inset-0 bg-black/50"
						onPress={() => setShowAddModal(false)}
					/>
					<View
						className={`rounded-t-3xl p-6 pb-10 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}
					>
						<View className="flex-row items-center justify-between mb-6">
							<Text
								className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								Adicionar Veículo
							</Text>
							<TouchableOpacity
								onPress={() => setShowAddModal(false)}
								className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"
							>
								<Ionicons
									name="close"
									size={20}
									color={isDark ? '#FFF' : '#000'}
								/>
							</TouchableOpacity>
						</View>

						<Text className="text-sm font-black text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
							Tipo
						</Text>
						<View className="flex-row gap-3 mb-5">
							{VEHICLE_TYPES.map((opt) => {
								const isActive = type === opt.value;
								return (
									<TouchableOpacity
										key={opt.value}
										onPress={() => setType(opt.value)}
										className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl gap-1.5 ${isActive ? 'bg-primary' : isDark ? 'bg-[#262626]' : 'bg-gray-100'}`}
									>
										<Ionicons
											name={opt.icon as any}
											size={18}
											color={
												isActive
													? '#231F20'
													: themeColors.text
											}
										/>
										<Text
											className={`text-sm font-black ${isActive ? 'text-secondary' : 'text-gray-500 dark:text-gray-400'}`}
										>
											{opt.label}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>

						<View
							className="px-4 py-3.5 rounded-2xl border mb-3"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
							}}
						>
							<TextInput
								className="text-base font-bold"
								style={{ color: themeColors.text }}
								placeholder="Placa (ex: LD-45-12-AA)"
								placeholderTextColor="#9CA3AF"
								value={plateNumber}
								onChangeText={setPlateNumber}
								autoCapitalize="characters"
							/>
						</View>
						<View className="flex-row gap-3 mb-3">
							<View
								className="flex-1 px-4 py-3.5 rounded-2xl border"
								style={{
									backgroundColor: isDark
										? '#2A2A2A'
										: '#F9FAFB',
									borderColor: isDark ? '#333' : '#E5E7EB',
								}}
							>
								<TextInput
									className="text-base font-bold"
									style={{ color: themeColors.text }}
									placeholder="Marca"
									placeholderTextColor="#9CA3AF"
									value={brand}
									onChangeText={setBrand}
								/>
							</View>
							<View
								className="flex-1 px-4 py-3.5 rounded-2xl border"
								style={{
									backgroundColor: isDark
										? '#2A2A2A'
										: '#F9FAFB',
									borderColor: isDark ? '#333' : '#E5E7EB',
								}}
							>
								<TextInput
									className="text-base font-bold"
									style={{ color: themeColors.text }}
									placeholder="Modelo"
									placeholderTextColor="#9CA3AF"
									value={model}
									onChangeText={setModel}
								/>
							</View>
						</View>
						<View
							className="px-4 py-3.5 rounded-2xl border mb-5"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
							}}
						>
							<TextInput
								className="text-base font-bold"
								style={{ color: themeColors.text }}
								placeholder="Ano (ex: 2020)"
								placeholderTextColor="#9CA3AF"
								value={year}
								onChangeText={setYear}
								keyboardType="number-pad"
								maxLength={4}
							/>
						</View>
						<View
							className="px-4 py-3.5 rounded-2xl border mb-5"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
							}}
						>
							<TextInput
								className="text-base font-bold"
								style={{ color: themeColors.text }}
								placeholder="Cor"
								placeholderTextColor="#9CA3AF"
								value={color}
								onChangeText={setColor}
							/>
						</View>

						<Text className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
							Foto do Veículo
						</Text>
						<TouchableOpacity
							onPress={pickVehiclePhoto}
							disabled={uploadingPhoto}
							className="flex-row items-center justify-center py-3.5 rounded-2xl border mb-5"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
							}}
						>
							{uploadingPhoto ? (
								<ActivityIndicator
									color={themeColors.primary}
									size="small"
								/>
							) : photoUrl ? (
								<View className="flex-row items-center gap-2">
									<Image
										source={{ uri: photoUrl }}
										className="w-8 h-8 rounded-lg"
									/>
									<Text className="text-sm font-black text-primary">
										Alterar Foto
									</Text>
								</View>
							) : (
								<View className="flex-row items-center gap-2">
									<Ionicons
										name="camera-outline"
										size={20}
										color={themeColors.primary}
									/>
									<Text className="text-sm font-black text-primary">
										Adicionar Foto
									</Text>
								</View>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							onPress={handleAddVehicle}
							className="py-4 rounded-2xl items-center bg-primary active:opacity-70"
							disabled={createMutation.isPending}
						>
							{createMutation.isPending ? (
								<ActivityIndicator color="#000" />
							) : (
								<Text className="text-base font-black text-secondary">
									Cadastrar
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			</Modal>

			{/* Edit Modal */}
			<Modal
				visible={showEditModal}
				animationType="slide"
				transparent
				onRequestClose={() => {
					setShowEditModal(false);
					setEditingVehicle(null);
				}}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1 justify-end"
				>
					<Pressable
						className="absolute inset-0 bg-black/50"
						onPress={() => {
							setShowEditModal(false);
							setEditingVehicle(null);
						}}
					/>
					<View
						className={`rounded-t-3xl p-6 pb-10 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}
					>
						<View className="flex-row items-center justify-between mb-6">
							<Text
								className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								Editar Veículo
							</Text>
							<TouchableOpacity
								onPress={() => {
									setShowEditModal(false);
									setEditingVehicle(null);
								}}
								className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"
							>
								<Ionicons
									name="close"
									size={20}
									color={isDark ? '#FFF' : '#000'}
								/>
							</TouchableOpacity>
						</View>

						<Text className="text-sm font-black text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
							Tipo
						</Text>
						<View className="flex-row gap-3 mb-5">
							{VEHICLE_TYPES.map((opt) => {
								const isActive = type === opt.value;
								return (
									<TouchableOpacity
										key={opt.value}
										onPress={() => setType(opt.value)}
										className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl gap-1.5 ${isActive ? 'bg-primary' : isDark ? 'bg-[#262626]' : 'bg-gray-100'}`}
									>
										<Ionicons
											name={opt.icon as any}
											size={18}
											color={
												isActive
													? '#231F20'
													: themeColors.text
											}
										/>
										<Text
											className={`text-sm font-black ${isActive ? 'text-secondary' : 'text-gray-500 dark:text-gray-400'}`}
										>
											{opt.label}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>

						<View
							className="px-4 py-3.5 rounded-2xl border mb-3"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
							}}
						>
							<TextInput
								className="text-base font-bold"
								style={{ color: themeColors.text }}
								placeholder="Placa (ex: LD-45-12-AA)"
								placeholderTextColor="#9CA3AF"
								value={plateNumber}
								onChangeText={setPlateNumber}
								autoCapitalize="characters"
							/>
						</View>
						<View className="flex-row gap-3 mb-3">
							<View
								className="flex-1 px-4 py-3.5 rounded-2xl border"
								style={{
									backgroundColor: isDark
										? '#2A2A2A'
										: '#F9FAFB',
									borderColor: isDark ? '#333' : '#E5E7EB',
								}}
							>
								<TextInput
									className="text-base font-bold"
									style={{ color: themeColors.text }}
									placeholder="Marca"
									placeholderTextColor="#9CA3AF"
									value={brand}
									onChangeText={setBrand}
								/>
							</View>
							<View
								className="flex-1 px-4 py-3.5 rounded-2xl border"
								style={{
									backgroundColor: isDark
										? '#2A2A2A'
										: '#F9FAFB',
									borderColor: isDark ? '#333' : '#E5E7EB',
								}}
							>
								<TextInput
									className="text-base font-bold"
									style={{ color: themeColors.text }}
									placeholder="Modelo"
									placeholderTextColor="#9CA3AF"
									value={model}
									onChangeText={setModel}
								/>
							</View>
						</View>
						<View
							className="px-4 py-3.5 rounded-2xl border mb-5"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
							}}
						>
							<TextInput
								className="text-base font-bold"
								style={{ color: themeColors.text }}
								placeholder="Ano (ex: 2020)"
								placeholderTextColor="#9CA3AF"
								value={year}
								onChangeText={setYear}
								keyboardType="number-pad"
								maxLength={4}
							/>
						</View>
						<View
							className="px-4 py-3.5 rounded-2xl border mb-5"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
							}}
						>
							<TextInput
								className="text-base font-bold"
								style={{ color: themeColors.text }}
								placeholder="Cor"
								placeholderTextColor="#9CA3AF"
								value={color}
								onChangeText={setColor}
							/>
						</View>

						<Text className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
							Foto do Veículo
						</Text>
						<TouchableOpacity
							onPress={pickVehiclePhoto}
							disabled={uploadingPhoto}
							className="flex-row items-center justify-center py-3.5 rounded-2xl border mb-5"
							style={{
								backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
								borderColor: isDark ? '#333' : '#E5E7EB',
							}}
						>
							{uploadingPhoto ? (
								<ActivityIndicator
									color={themeColors.primary}
									size="small"
								/>
							) : photoUrl ? (
								<View className="flex-row items-center gap-2">
									<Image
										source={{ uri: photoUrl }}
										className="w-8 h-8 rounded-lg"
									/>
									<Text className="text-sm font-black text-primary">
										Alterar Foto
									</Text>
								</View>
							) : (
								<View className="flex-row items-center gap-2">
									<Ionicons
										name="camera-outline"
										size={20}
										color={themeColors.primary}
									/>
									<Text className="text-sm font-black text-primary">
										Adicionar Foto
									</Text>
								</View>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							onPress={handleEditVehicle}
							className="py-4 rounded-2xl items-center bg-primary active:opacity-70"
							disabled={updateMutation.isPending}
						>
							{updateMutation.isPending ? (
								<ActivityIndicator color="#000" />
							) : (
								<Text className="text-base font-black text-secondary">
									Salvar
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}
