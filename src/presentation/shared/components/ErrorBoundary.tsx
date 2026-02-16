import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from './ui/AppText';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    // TODO: Log to Crashlytics
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 items-center justify-center p-6">
          <AppText className="text-red-500 text-lg mb-4">Something went wrong</AppText>
          <Pressable
            onPress={this.handleReset}
            className="bg-indigo-500 px-6 py-3 rounded-xl"
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <AppText className="text-white font-semibold">Try Again</AppText>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
