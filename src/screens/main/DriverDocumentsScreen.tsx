import React from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import type { DriverDocument, DocumentStatus } from '../../types/api';

const STATUS_COLORS: Record<DocumentStatus, { bg: string; text: string; label: string }> = {
	PENDING: { bg: '#FEF3C7', text: '#92400E', label: 'Pendente' },
	APPROVED: { bg: '#D1FAE5', text: '#065F46', label: 'Aprovado' },
	REJECTED: { bg: '#FEE2E2', text: '#991B1B', label: 'Rejeitado' },
	EXPIRED: { bg: '#F3F4F6', text: '#6B7280', label: 'Expirado' },
};

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

export default function DriverDocumentsScreen() {
	const navigation = useNavigation();
	const { themeColors, isDark } = useThemeColors();
	const { data: driverProfile, isLoading, refetch } = useDriverProfile();

	const documents = driverProfile?.documents ?? [];

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
					Documentos
				</Text>
				<View className="w-10" />
			</View>

			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
			>
				<Animated.View entering={FadeInDown.duration(600)} className="mt-4">
					<View
						className="p-5 rounded-2xl mb-4"
						style={{ backgroundColor: isDark ? '#1A1A1A' : '#F9FAFB' }}
					>
						<Text className="text-sm font-bold mb-1" style={{ color: themeColors.text }}>
							Compliance: {driverProfile?.complianceStatus === 'APPROVED' ? 'Aprovado' :
								driverProfile?.complianceStatus === 'PENDING' ? 'Pendente' :
									driverProfile?.complianceStatus === 'REJECTED' ? 'Rejeitado' : 'Suspenso'}
						</Text>
						<Text className="text-xs text-gray-500">
							{driverProfile?.complianceStatus === 'APPROVED'
								? 'Todos os documentos foram aprovados'
								: 'Envie os documentos necessários para aprovação'}
						</Text>
					</View>

					{documents.length === 0 ? (
						<View className="items-center py-16">
							<Ionicons name="document-text-outline" size={64} color={isDark ? '#404040' : '#D1D5DB'} />
							<Text className="text-lg font-bold mt-4" style={{ color: themeColors.text }}>
								Nenhum documento
							</Text>
							<Text className="text-sm mt-2 text-gray-500 text-center">
								Os documentos enviados aparecerão aqui.
							</Text>
						</View>
					) : (
						documents.map((doc, index) => {
							const statusConfig = STATUS_COLORS[doc.status as DocumentStatus] ?? STATUS_COLORS.PENDING;
							return (
								<Animated.View
									key={doc.id}
									entering={FadeInRight.duration(500).delay(index * 60)}
								>
									<View
										className="flex-row items-center p-4 rounded-2xl mb-3"
										style={{
											backgroundColor: isDark ? '#1A1A1A' : '#FFF',
											elevation: 2,
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.05,
											shadowRadius: 8,
										}}
									>
										<View className="w-12 h-12 rounded-xl items-center justify-center bg-primary/20">
											<Ionicons name="document-text" size={24} color={themeColors.primary} />
										</View>
										<View className="flex-1 ml-3">
											<Text className="text-base font-bold" style={{ color: themeColors.text }}>
												{DocumentTypeLabel(doc.type)}
											</Text>
											{doc.rejectionReason && (
												<Text className="text-xs text-red-500 mt-0.5" numberOfLines={1}>
													Motivo: {doc.rejectionReason}
												</Text>
											)}
										</View>
										<View className="px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: statusConfig.bg }}>
											<Text className="text-xs font-bold" style={{ color: statusConfig.text }}>
												{statusConfig.label}
											</Text>
										</View>
									</View>
								</Animated.View>
							);
						})
					)}
				</Animated.View>

				<View className="h-10" />
			</ScrollView>
		</SafeAreaView>
	);
}
