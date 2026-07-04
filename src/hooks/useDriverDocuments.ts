import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import {
	fetchDriverDocuments,
	uploadDocument,
} from '../api/drivers';

export function useDriverDocuments() {
	return useQuery({
		queryKey: ['driver', 'documents'],
		queryFn: fetchDriverDocuments,
	});
}

export function useUploadDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			type,
			fileUrl,
			expiryDate,
		}: {
			type: string;
			fileUrl: string;
			expiryDate?: string;
		}) => uploadDocument(type, fileUrl, expiryDate),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['driver', 'documents'] });
			queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
			Alert.alert('Sucesso', 'Documento enviado com sucesso');
		},
		onError: (err: AxiosError<{ msg?: string }>) => {
			Alert.alert('Erro', err.response?.data?.msg || 'Erro ao enviar documento');
		},
	});
}
