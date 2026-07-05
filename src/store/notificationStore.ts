import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotificationState = {
	pushEnabled: boolean;
	emailEnabled: boolean;
	soundsEnabled: boolean;
	setPushEnabled: (enabled: boolean) => void;
	setEmailEnabled: (enabled: boolean) => void;
	setSoundsEnabled: (enabled: boolean) => void;
};

export const useNotificationStore = create<NotificationState>()(
	persist(
		(set) => ({
			pushEnabled: true,
			emailEnabled: false,
			soundsEnabled: true,

			setPushEnabled: (pushEnabled) => set({ pushEnabled }),
			setEmailEnabled: (emailEnabled) => set({ emailEnabled }),
			setSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),
		}),
		{
			name: 'notification-prefs',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
