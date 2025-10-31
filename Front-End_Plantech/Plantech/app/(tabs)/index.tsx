import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button } from 'react-native';
import api from '../../api.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlantas = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await api.get('/plantas', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPlantas(response.data);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error("Erro ao buscar plantas:", error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchPlantas();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/login');
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ThemedView style={styles.container}>
      <Button title="Sair" onPress={handleLogout} />
      <FlatList
        data={plantas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ThemedText type="subtitle">{item.nome}</ThemedText>
            <ThemedText>{item.descricao}</ThemedText>
          </View>
        )}
        ListEmptyComponent={<ThemedText>Nenhuma planta encontrada.</ThemedText>}
        ListHeaderComponent={<ThemedText type="title" style={{marginBottom: 20}}>Minhas Plantas</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  loader: { flex: 1, justifyContent: 'center' },
  item: { padding: 20, marginVertical: 8, backgroundColor: '#f9f9f9', borderRadius: 5 },
});