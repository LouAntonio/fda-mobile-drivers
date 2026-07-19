import { io, Socket } from 'socket.io-client';
import { API_URL } from '@env';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
	return socket;
}

export function connectSocket(token: string): Socket {
	if (socket?.connected) {
		return socket;
	}

	socket = io(`${API_URL}/trips`, {
		auth: { token },
		transports: ['websocket'],
		reconnection: true,
		reconnectionAttempts: 10,
		reconnectionDelay: 2000,
	});

	socket.on('connect', () => {
		// connected
	});

	socket.on('disconnect', (reason) => {
		// disconnected: reason
	});

	socket.on('error', (err: { message: string }) => {
		// socket error: err.message
	});

	return socket;
}

export function disconnectSocket() {
	if (socket) {
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
	}
}

export function joinTripRoom(tripId: string) {
	socket?.emit('join:trip', tripId);
}

export function leaveTripRoom(tripId: string) {
	socket?.emit('leave:trip', tripId);
}
