import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
	Login: undefined;
	Register: undefined;
	ForgotPassword: undefined;
	VerifyToken: { email: string };
	ResetPassword: { token: string };
};

export type MainStackParamList = {
	Home: undefined;
	Profile: undefined;
	History: undefined;
	Info: undefined;
	Contact: undefined;
	Settings: undefined;
	ActiveTrip: { tripId: string };
	TripDetail: { tripId: string };
	DriverEarnings: undefined;
	DriverDocuments: undefined;
	DriverVehicle: undefined;
	Addresses: undefined;
};

export type RootStackParamList = {
	Splash: undefined;
	Onboarding: undefined;
	Auth: NavigatorScreenParams<AuthStackParamList>;
	Main: NavigatorScreenParams<MainStackParamList>;
};
