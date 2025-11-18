import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import api from '../../api';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen() {
  interface Planta {
    id: number;
    nome: string;
    descricao?: string;
  }
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fetchPlantas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<Planta[]>('/plantas');
      setPlantas(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar plantas:', err);
      if (err?.response && (err.response.status === 401 || err.response.status === 403)) {
        Alert.alert('Sessão expirada', 'Por favor, faça login novamente.');
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchPlantas();
    }, [fetchPlantas])
  );

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('userToken');
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
    router.replace('/login');
  };

  if (loading && plantas.length === 0) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={plantas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ThemedText type="subtitle">{item.nome}</ThemedText>
            <ThemedText>{item.descricao}</ThemedText>
            {}
          </View>
        )}
        ListEmptyComponent={<ThemedText>Nenhuma planta encontrada.</ThemedText>}
        ListHeaderComponent={
          <View style={styles.header}>
             <ThemedText type="title">Minhas Plantas</ThemedText>
             <Button title="Sair" onPress={handleLogout} color="red" />
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  loader: { flex: 1, justifyContent: 'center' },
  item: { padding: 20, marginVertical: 8, backgroundColor: '#e0e0e0', borderRadius: 10 },
});