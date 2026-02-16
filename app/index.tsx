import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check auth state and redirect accordingly
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href="/(main)/(feed)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
