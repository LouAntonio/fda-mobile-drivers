import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
	id: string;
	name: string;
	surname: string;
	phoneNumber: string;
	email?: string | null;
	emailVerified?: boolean;
	phoneNumberVerified?: boolean;
	image?: string | null;
	role: string;
	hasPassword?: boolean;
	accounts?: { providerId: string }[];
	emergencyContactName?: string | null;
	emergencyContactPhone?: string | null;
	createdAt?: string;
	updatedAt?: string;
	driverProfile?: {
		id: string;
		complianceStatus: string;
		availability: string;
		availableBalance: number;
		pendingBalance: number;
		ratingAverage: number;
		completedTripsCount: number;
	} | null;
};

type AuthState = {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	hydrated: boolean;
	setAuth: (user: User, accessToken: string, refreshToken: string) => void;
	setTokens: (accessToken: string, refreshToken: string) => void;
	setUser: (user: User) => void;
	setHydrated: (hydrated: boolean) => void;
	logout: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,
			hydrated: false,

			setAuth: (user, accessToken, refreshToken) =>
				set({
					user,
					accessToken,
					refreshToken,
					isAuthenticated: true,
				}),

			setTokens: (accessToken, refreshToken) =>
				set({ accessToken, refreshToken }),

			setUser: (user) => set({ user }),

			setHydrated: (hydrated) => set({ hydrated }),

			logout: () =>
				set({
					user: null,
					accessToken: null,
					refreshToken: null,
					isAuthenticated: false,
				}),
		}),
		{
			name: 'auth-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				user: state.user,
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.setHydrated(true);
				}
			},
		},
	),
);
