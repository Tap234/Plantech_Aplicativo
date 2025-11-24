// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // verifica se já existe token salvo e redireciona automaticamente
    const checkToken = async () => {
      try {
        let token = null;
        if (Platform.OS === 'web') {
          token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }

        if (token) {
          router.replace('(tabs)');
        } else {
          router.replace('login');
        }
      } catch (e) {
        // se der erro, abrir tela de login
        router.replace('login');
      }
    };

    checkToken();
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* A tela de Login agora faz parte do Stack */}
        <Stack.Screen name="login" options={{ headerShown: false }} /> 
        {/* A tela de abas (tabs) não mostra o cabeçalho do Stack */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}