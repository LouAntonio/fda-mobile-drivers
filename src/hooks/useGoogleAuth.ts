import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GOOGLE_CLIENT_ID, EXPO_REDIRECT_URI } from '@env';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
	const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
		clientId: GOOGLE_CLIENT_ID,
		redirectUri: EXPO_REDIRECT_URI,
	});

	return {
		promptAsync,
		request,
		response,
	};
}
