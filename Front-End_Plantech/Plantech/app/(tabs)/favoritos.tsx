import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../api';
import { useFocusEffect } from '@react-navigation/native';

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

  const uploadsBase = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '/uploads') : 'http://localhost:8080/uploads';

  const renderItem = ({ item }: { item: PlantaItem }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/planta/${item.id}`)}
      style={styles.cardTouchable}
    >
      <View style={styles.card}>
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
      </View>
    </TouchableOpacity>
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
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/login')}>
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
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
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
