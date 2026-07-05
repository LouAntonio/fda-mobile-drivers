import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import DriverHomeScreen from '../screens/main/DriverHomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import InfoScreen from '../screens/main/InfoScreen';
import ContactScreen from '../screens/main/ContactScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import DriverActiveTripScreen from '../screens/main/DriverActiveTripScreen';
import TripDetailScreen from '../screens/main/TripDetailScreen';
import DriverEarningsScreen from '../screens/main/DriverEarningsScreen';
import DriverDocumentsScreen from '../screens/main/DriverDocumentsScreen';
import DriverVehicleScreen from '../screens/main/DriverVehicleScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Home" component={DriverHomeScreen} />
			<Stack.Screen name="Profile" component={ProfileScreen} />
			<Stack.Screen name="History" component={HistoryScreen} />
			<Stack.Screen name="Info" component={InfoScreen} />
			<Stack.Screen name="Contact" component={ContactScreen} />
			<Stack.Screen name="Settings" component={SettingsScreen} />
			<Stack.Screen
				name="ActiveTrip"
				component={DriverActiveTripScreen}
			/>
			<Stack.Screen name="TripDetail" component={TripDetailScreen} />
			<Stack.Screen
				name="DriverEarnings"
				component={DriverEarningsScreen}
			/>
			<Stack.Screen
				name="DriverDocuments"
				component={DriverDocumentsScreen}
			/>
			<Stack.Screen
				name="DriverVehicle"
				component={DriverVehicleScreen}
			/>
		</Stack.Navigator>
	);
}
