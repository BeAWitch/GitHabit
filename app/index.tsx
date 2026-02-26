import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the first tab (Home) immediately on load
  return <Redirect href="/(tabs)" />;
}
