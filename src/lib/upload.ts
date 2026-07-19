import { api } from './api';
import axios from 'axios';

interface UploadSignature {
	signature: string;
	timestamp: number;
	cloudName: string;
	apiKey: string;
	folder: string;
}

export async function uploadToCloudinary(
	fileUri: string,
	folder?: string,
): Promise<string> {
	const { data: sigData } = await api.post('/uploads/signature', {
		folder,
	});
	const sig = sigData as UploadSignature;

	const formData = new FormData();
	const filename = fileUri.split('/').pop() ?? 'photo.jpg';
	const ext = filename.split('.').pop() ?? 'jpg';

	formData.append('file', {
		uri: fileUri,
		name: filename,
		type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
	} as any);
	formData.append('signature', sig.signature);
	formData.append('timestamp', String(sig.timestamp));
	formData.append('api_key', sig.apiKey);
	formData.append('folder', sig.folder);

	const res = await axios.post(
		`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
		formData,
		{
			headers: { 'Content-Type': 'multipart/form-data' },
		},
	);

	return res.data.secure_url as string;
}
