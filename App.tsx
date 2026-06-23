import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuthStore } from './src/stores/authStore';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
