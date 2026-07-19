import React, { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	RefreshControl,
	Modal,
	Pressable,
	KeyboardAvoidingView,
	Platform,
	TextInput,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import {
	useDriverDocuments,
	useUploadDocument,
} from '../../hooks/useDriverDocuments';
import { uploadToCloudinary } from '../../lib/upload';
import type { DocumentStatus } from '../../types/api';

const STATUS_CONFIG: Record<
	DocumentStatus,
	{ bg: string; text: string; label: string; icon: string; iconColor: string }
> = {
	PENDING: {
		bg: '#FEF3C7',
		text: '#92400E',
		label: 'Pendente',
		icon: 'time-outline',
		iconColor: '#F59E0B',
	},
	APPROVED: {
		bg: '#D1FAE5',
		text: '#065F46',
		label: 'Aprovado',
		icon: 'checkmark-circle',
		iconColor: '#10B981',
	},
	REJECTED: {
		bg: '#FEE2E2',
		text: '#991B1B',
		label: 'Rejeitado',
		icon: 'close-circle',
		iconColor: '#ED1C24',
	},
	EXPIRED: {
		bg: '#F3F4F6',
		text: '#6B7280',
		label: 'Expirado',
		icon: 'alert-circle',
		iconColor: '#6B7280',
	},
};

const DOCUMENT_TYPES = [
	{ key: 'bi', label: 'Bilhete de Identidade', icon: 'id-card' },
	{ key: 'license', label: 'Carta de Condução', icon: 'car' },
	{ key: 'certidao', label: 'Certidão', icon: 'document-text' },
	{ key: 'photo', label: 'Foto do Motorista', icon: 'camera' },
	{ key: 'insurance', label: 'Seguro', icon: 'shield-checkmark' },
];

function DocumentTypeLabel(type: string): string {
	const map: Record<string, string> = {
		bi: 'Bilhete de Identidade',
		license: 'Carta de Condução',
		certidao: 'Certidão',
		photo: 'Foto do Motorista',
		insurance: 'Seguro',
	};
	return map[type] ?? type;
}

function DocumentIcon(type: string): string {
	const icons: Record<string, string> = {
		bi: 'id-card',
		license: 'car',
		certidao: 'document-text',
		photo: 'camera',
		insurance: 'shield-checkmark',
	};
	return icons[type] || 'document-text';
}

export default function DriverDocumentsScreen() {
	const navigation = useNavigation();
	const { themeColors, isDark } = useThemeColors();
	const { data: driverProfile } = useDriverProfile();
	const { data: documents = [], isLoading, refetch } = useDriverDocuments();
	const uploadMutation = useUploadDocument();

	const [showUploadModal, setShowUploadModal] = useState(false);
	const [selectedType, setSelectedType] = useState('bi');
	const [fileUrl, setFileUrl] = useState('');
	const [expiryDate, setExpiryDate] = useState('');
	const [uploadingFile, setUploadingFile] = useState(false);

	const complianceStatus = driverProfile?.complianceStatus;

	const pickImage = async (fromCamera: boolean) => {
		const permission = fromCamera
			? await ImagePicker.requestCameraPermissionsAsync()
			: await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permission.granted) {
			Alert.alert('Permissão', 'É necessário permitir o acesso à ' + (fromCamera ? 'câmara' : 'galeria'));
			return;
		}

		const result = fromCamera
			? await ImagePicker.launchCameraAsync({
					mediaTypes: ['images'],
					quality: 0.8,
				})
			: await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ['images'],
					quality: 0.8,
				});

		if (result.canceled) return;

		setUploadingFile(true);
		try {
			const uri = result.assets[0].uri;
			const uploadedUrl = await uploadToCloudinary(uri, 'documents');
			setFileUrl(uploadedUrl);
			Alert.alert('Sucesso', 'Ficheiro carregado com sucesso');
		} catch {
			Alert.alert('Erro', 'Falha ao carregar ficheiro');
		} finally {
			setUploadingFile(false);
		}
	};

	const handleUpload = () => {
		if (!fileUrl.trim()) {
			Alert.alert('Atenção', 'Selecione ou insira o URL do documento');
			return;
		}
		uploadMutation.mutate(
			{
				type: selectedType,
				fileUrl: fileUrl.trim(),
				expiryDate: expiryDate || undefined,
			},
			{
				onSuccess: () => {
					setShowUploadModal(false);
					setFileUrl('');
					setExpiryDate('');
				},
			},
		);
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
					Documentos
				</Text>
				<TouchableOpacity
					onPress={() => setShowUploadModal(true)}
					className="w-10 h-10 items-center justify-center rounded-full bg-primary/10"
				>
					<Ionicons
						name="cloud-upload-outline"
						size={22}
						color={themeColors.primary}
					/>
				</TouchableOpacity>
			</View>

			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						onRefresh={refetch}
					/>
				}
			>
				{/* Compliance Status Card */}
				<Animated.View
					entering={FadeInDown.duration(600)}
					className="mt-4"
				>
					<View
						className="p-5 rounded-2xl flex-row items-center gap-4"
						style={{
							backgroundColor:
								complianceStatus === 'APPROVED'
									? 'rgba(16,185,129,0.1)'
									: complianceStatus === 'REJECTED'
										? 'rgba(239,68,68,0.1)'
										: 'rgba(245,158,11,0.1)',
							borderWidth: 1,
							borderColor:
								complianceStatus === 'APPROVED'
									? 'rgba(16,185,129,0.3)'
									: complianceStatus === 'REJECTED'
										? 'rgba(239,68,68,0.3)'
										: 'rgba(245,158,11,0.3)',
						}}
					>
						<View
							className={`w-12 h-12 rounded-2xl items-center justify-center ${complianceStatus === 'APPROVED' ? 'bg-green-500/20' : complianceStatus === 'REJECTED' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}
						>
							<Ionicons
								name="shield-checkmark"
								size={24}
								color={
									complianceStatus === 'APPROVED'
										? '#10B981'
										: complianceStatus === 'REJECTED'
											? '#ED1C24'
											: '#F59E0B'
								}
							/>
						</View>
						<View className="flex-1">
							<Text className="text-base font-black text-secondary dark:text-off-white">
								Compliance:{' '}
								{complianceStatus === 'APPROVED'
									? 'Aprovado'
									: complianceStatus === 'PENDING'
										? 'Pendente'
										: complianceStatus === 'REJECTED'
											? 'Rejeitado'
											: 'Suspenso'}
							</Text>
							<Text
								className="text-xs font-bold mt-1"
								style={{ color: themeColors.text }}
							>
								{complianceStatus === 'APPROVED'
									? 'Todos os documentos aprovados'
									: complianceStatus === 'REJECTED'
										? 'Alguns documentos foram rejeitados'
										: 'Documentos em análise'}
							</Text>
						</View>
						{complianceStatus === 'APPROVED' && (
							<View className="px-3 py-1.5 rounded-lg bg-green-500/20">
								<Text className="text-xs font-black text-green-600">
									OK
								</Text>
							</View>
						)}
					</View>
				</Animated.View>

				{/* Document List */}
				<Animated.View
					entering={FadeInDown.duration(600).delay(100)}
					className="mt-6"
				>
					{documents.length === 0 ? (
						<View className="items-center py-16">
							<Ionicons
								name="document-text-outline"
								size={56}
								color={isDark ? '#404040' : '#D1D5DB'}
							/>
							<Text className="text-lg font-black text-secondary dark:text-off-white mt-4">
								Nenhum documento
							</Text>
							<Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 text-center">
								Toque no ícone de upload para enviar um
								documento.
							</Text>
						</View>
					) : (
						documents.map((doc, index) => {
							const statusConfig =
								STATUS_CONFIG[doc.status as DocumentStatus] ??
								STATUS_CONFIG.PENDING;
							return (
								<Animated.View
									key={doc.id}
									entering={FadeInRight.duration(500).delay(
										index * 60,
									)}
								>
									<View
										className="flex-row items-center p-4 rounded-2xl mb-3"
										style={{
											backgroundColor: isDark
												? '#1A1A1A'
												: '#FFF',
											elevation: 2,
											shadowColor: '#000',
											shadowOffset: {
												width: 0,
												height: 2,
											},
											shadowOpacity: 0.05,
											shadowRadius: 8,
										}}
									>
										<View className="w-14 h-14 rounded-2xl items-center justify-center bg-primary/10">
											<Ionicons
												name={
													(DocumentIcon(doc.type) ||
														'document-text') as any
												}
												size={26}
												color={themeColors.primary}
											/>
										</View>
										<View className="flex-1 ml-4">
											<Text className="text-base font-black text-secondary dark:text-off-white">
												{DocumentTypeLabel(doc.type)}
											</Text>
											{doc.expiryDate && (
												<Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
													Expira:{' '}
													{new Date(
														doc.expiryDate,
													).toLocaleDateString(
														'pt-AO',
													)}
												</Text>
											)}
											{doc.rejectionReason && (
												<Text
													className="text-xs font-bold text-red-500 mt-1"
													numberOfLines={1}
												>
													Motivo:{' '}
													{doc.rejectionReason}
												</Text>
											)}
										</View>
										<View
											className="px-3 py-1.5 rounded-lg"
											style={{
												backgroundColor:
													statusConfig.bg,
											}}
										>
											<View className="flex-row items-center gap-1">
												<Ionicons
													name={
														statusConfig.icon as any
													}
													size={12}
													color={
														statusConfig.iconColor
													}
												/>
												<Text
													className="text-xs font-black"
													style={{
														color: statusConfig.text,
													}}
												>
													{statusConfig.label}
												</Text>
											</View>
										</View>
									</View>
								</Animated.View>
							);
						})
					)}
				</Animated.View>

				<View className="h-10" />
			</ScrollView>

			{/* Upload Modal */}
			<Modal
				visible={showUploadModal}
				animationType="slide"
				transparent
				onRequestClose={() => setShowUploadModal(false)}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1 justify-end"
				>
					<Pressable
						className="absolute inset-0 bg-black/50"
						onPress={() => setShowUploadModal(false)}
					/>
					<View
						className={`rounded-t-3xl p-6 pb-10 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}
					>
						<View className="flex-row items-center justify-between mb-6">
							<Text
								className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}
							>
								Enviar Documento
							</Text>
							<TouchableOpacity
								onPress={() => setShowUploadModal(false)}
								className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"
							>
								<Ionicons
									name="close"
									size={20}
									color={isDark ? '#FFF' : '#000'}
								/>
							</TouchableOpacity>
						</View>

						<ScrollView showsVerticalScrollIndicator={false}>
							<Text className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
								Tipo de Documento
							</Text>
							<View className="flex-row flex-wrap gap-2 mb-5">
								{DOCUMENT_TYPES.map((opt) => {
									const active = selectedType === opt.key;
									return (
										<TouchableOpacity
											key={opt.key}
											onPress={() =>
												setSelectedType(opt.key)
											}
											className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-full ${active ? 'bg-primary' : isDark ? 'bg-[#262626] border border-gray-800' : 'bg-gray-100'}`}
										>
											<Ionicons
												name={opt.icon as any}
												size={16}
												color={
													active
														? '#231F20'
														: isDark
															? '#888'
															: '#666'
												}
											/>
											<Text
												className={`text-xs font-black ${active ? 'text-secondary' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
											>
												{opt.label}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>

							<Text className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
								Selecionar Ficheiro
							</Text>
							<View className="flex-row gap-3 mb-4">
								<TouchableOpacity
									onPress={() => pickImage(false)}
									disabled={uploadingFile}
									className="flex-1 flex-row items-center justify-center py-3.5 rounded-2xl border"
									style={{
										backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
										borderColor: isDark ? '#333' : '#E5E7EB',
									}}
								>
									{uploadingFile ? (
										<ActivityIndicator color={themeColors.primary} size="small" />
									) : (
										<>
											<Ionicons name="images-outline" size={20} color={themeColors.primary} />
											<Text className="text-sm font-black text-primary ml-2">Galeria</Text>
										</>
									)}
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => pickImage(true)}
									disabled={uploadingFile}
									className="flex-1 flex-row items-center justify-center py-3.5 rounded-2xl border"
									style={{
										backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
										borderColor: isDark ? '#333' : '#E5E7EB',
									}}
								>
									{uploadingFile ? (
										<ActivityIndicator color={themeColors.primary} size="small" />
									) : (
										<>
											<Ionicons name="camera-outline" size={20} color={themeColors.primary} />
											<Text className="text-sm font-black text-primary ml-2">Câmara</Text>
										</>
									)}
								</TouchableOpacity>
							</View>

							<Text className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
								Ou insira URL manualmente
							</Text>
							<View
								className="px-4 py-3.5 rounded-2xl border mb-3"
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
									placeholder="URL do documento"
									placeholderTextColor="#9CA3AF"
									value={fileUrl}
									onChangeText={setFileUrl}
									autoCapitalize="none"
								/>
							</View>
							<View
								className="px-4 py-3.5 rounded-2xl border mb-5"
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
									placeholder="Data de expiração (opcional)"
									placeholderTextColor="#9CA3AF"
									value={expiryDate}
									onChangeText={setExpiryDate}
								/>
							</View>

							<TouchableOpacity
								onPress={handleUpload}
								className="py-4 rounded-2xl items-center bg-primary active:opacity-70"
								disabled={uploadMutation.isPending}
							>
								{uploadMutation.isPending ? (
									<ActivityIndicator color="#000" />
								) : (
									<Text className="text-base font-black text-secondary">
										Enviar
									</Text>
								)}
							</TouchableOpacity>
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
}
