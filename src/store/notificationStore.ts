import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

type NotificationState = {
	pushEnabled: boolean;
	emailEnabled: boolean;
	soundsEnabled: boolean;
	loaded: boolean;
	setPushEnabled: (enabled: boolean) => void;
	setEmailEnabled: (enabled: boolean) => void;
	setSoundsEnabled: (enabled: boolean) => void;
	fetchFromServer: () => Promise<void>;
	syncToServer: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>()(
	persist(
		(set, get) => ({
			pushEnabled: true,
			emailEnabled: false,
			soundsEnabled: true,
			loaded: false,

			setPushEnabled: (pushEnabled) => {
				set({ pushEnabled });
				get().syncToServer();
			},
			setEmailEnabled: (emailEnabled) => {
				set({ emailEnabled });
				get().syncToServer();
			},
			setSoundsEnabled: (soundsEnabled) => {
				set({ soundsEnabled });
				get().syncToServer();
			},

			fetchFromServer: async () => {
				try {
					const { data } = await api.get('/users/me/notification-preferences');
					if (data) {
						set({
							pushEnabled: data.pushEnabled ?? true,
							emailEnabled: data.emailEnabled ?? false,
							soundsEnabled: data.soundsEnabled ?? true,
							loaded: true,
						});
					}
				} catch {
					set({ loaded: true });
				}
			},

			syncToServer: async () => {
				try {
					const { pushEnabled, emailEnabled, soundsEnabled } = get();
					await api.patch('/users/me/notification-preferences', {
						pushEnabled,
						emailEnabled,
						soundsEnabled,
					});
				} catch {
					// silently fail
				}
			},
		}),
		{
			name: 'notification-prefs',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				pushEnabled: state.pushEnabled,
				emailEnabled: state.emailEnabled,
				soundsEnabled: state.soundsEnabled,
			}),
		},
	),
);
