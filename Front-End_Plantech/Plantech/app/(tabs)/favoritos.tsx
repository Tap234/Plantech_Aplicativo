import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../api';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

type PlantaItem = {
  id: number | string;
  nome: string;
  fotoUrl?: string | null;
};

export default function FavoritosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [plantas, setPlantas] = useState<PlantaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlantas();
  }, []);

  // Recarrega sempre que a tela ganha foco (para pegar novas plantas adicionadas)
  useFocusEffect(
    useCallback(() => {
      loadPlantas();
    }, [])
  );

  async function loadPlantas() {
    try {
      setLoading(true);
      const res = await api.get('/plantas');
      setPlantas(res.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar plantas:', error);
      if (error.response?.status === 401) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: number | string) => {
    Alert.alert(
      'Excluir Planta',
      'Tem certeza que deseja excluir esta planta dos seus favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/plantas/${id}`);
              // Remove da lista localmente para feedback instantâneo
              setPlantas((prev) => prev.filter((p) => p.id !== id));
            } catch (error) {
              console.error('Erro ao excluir planta:', error);
              Alert.alert('Erro', 'Não foi possível excluir a planta.');
            }
          },
        },
      ]
    );
  };

  const uploadsBase = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '/uploads') : 'http://localhost:8080/uploads';

  const renderItem = ({ item }: { item: PlantaItem }) => (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/planta/${item.id}`)}
        style={styles.cardContent}
      >
        <View style={styles.thumb}>
          {(() => {
            const fotoField = item.fotoUrl || (item as any).foto || (item as any).imagemUrl || (item as any).imagem || (item as any).url || null;
            if (fotoField) {
              const imageUri = `${uploadsBase}/${fotoField}`;
              return <RNImage source={{ uri: imageUri }} style={{ width: 64, height: 64, borderRadius: 12 }} />;
            }
            return <Text style={styles.thumbText}>{item.nome?.charAt(0)}</Text>;
          })()}
        </View>
        <Text style={styles.cardTitle}>{item.nome}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <Feather name="trash-2" size={24} color="#A0A0A0" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoritos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0F4F3C" />
      ) : (
        <FlatList
          data={plantas}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View
        style={[
          styles.navbar,
          { paddingBottom: Math.max(insets.bottom, 12), height: 80 + Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/')}>
          <RNImage source={require('../../assets/images/Icone_Home.png')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/favoritos')}>
          <RNImage source={require('../../assets/images/Icone_Favoritos.png')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/usuario')}>
          <RNImage source={require('../../assets/images/Icone_Usuario.png')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DFF0DF',
    paddingTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0F4F3C',
    marginBottom: 18,
  },
  list: {
    width: '92%',
    paddingBottom: 100,
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E8F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  thumbText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#174C3C',
  },
  cardTitle: {
    fontSize: 20,
    color: '#0F4F3C',
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
  },
  deleteBtn: {
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    paddingHorizontal: 16,
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  navIcon: {
    width: 40,
    height: 40,
  },
});