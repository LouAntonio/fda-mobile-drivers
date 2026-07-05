import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		return null;
	}

	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
		});
	}

	const projectId =
		(Constants.expoConfig as { extra?: { eas?: { projectId?: string } } })
			?.extra?.eas?.projectId ?? undefined;

	if (!projectId) return null;

	const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
	return pushToken;
}

export async function registerPushTokenOnServer(): Promise<void> {
	const user = useAuthStore.getState().user;
	if (!user) return;

	const token = await registerForPushNotificationsAsync();
	if (!token) return;

	try {
		await api.post('/users/me/push-tokens', {
			token,
			deviceType: Platform.OS,
		});
	} catch {
		// Silently fail
	}
}
