import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught:', error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Algo deu errado</Text>
					<Text style={styles.message}>
						{this.state.error?.message ||
							'Ocorreu um erro inesperado.'}
					</Text>
					<TouchableOpacity
						style={styles.button}
						onPress={this.handleReset}
					>
						<Text style={styles.buttonText}>Tentar novamente</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return this.props.children;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		backgroundColor: '#121212',
	},
	title: {
		fontSize: 20,
		fontWeight: '700',
		color: '#FFD700',
		marginBottom: 12,
	},
	message: {
		fontSize: 14,
		color: '#9CA3AF',
		textAlign: 'center',
		marginBottom: 24,
		lineHeight: 20,
	},
	button: {
		backgroundColor: '#FFD700',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	buttonText: {
		color: '#121212',
		fontWeight: '600',
		fontSize: 14,
	},
});
