import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image as RNImage, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../../api';

export default function PlantaDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const id = params.id as string;

  const [plant, setPlant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlant();
  }, [id]);

  async function loadPlant() {
    try {
      setLoading(true);
      const res = await api.get(`/plantas/${id}`);
      setPlant(res.data);
    } catch (error) {
      alert('Erro ao carregar planta');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  // Função para lidar com o upload da foto (simplificada para exemplo)
  // Você precisará integrar o ImagePicker aqui depois
  const handlePhotoUpload = () => {
     alert('Aqui você integrará o expo-image-picker para enviar a foto para /api/plantas/' + id + '/foto');
  };

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#0F4F3C" /></View>;
  }

  if (!plant) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <RNImage
          source={plant.fotoUrl ? { uri: `${(api.defaults.baseURL || 'http://192.168.0.86:8080').replace('/api','/uploads')}/${plant.fotoUrl}` } : require('../../../assets/images/PlanTech.png')}
          style={styles.image}
          resizeMode="cover"
        />

        <Text style={styles.title}>{plant.nome}</Text>

        <TouchableOpacity style={styles.photoCard} activeOpacity={0.85} onPress={handlePhotoUpload}>
          <View style={styles.photoIconWrap}>
            <Text style={styles.photoIcon}>📷</Text>
          </View>
          <Text style={styles.photoCardText}>Fotos de controle</Text>
        </TouchableOpacity>

        <View style={styles.tasksCard}>
          <Text style={styles.tasksTitle}>Tarefas de hoje</Text>
          <View style={styles.taskList}>
            <Text style={styles.taskItem}>- Regar com 300 ml</Text>
            <Text style={styles.taskItem}>- Adubo NPK leve</Text>
            <Text style={styles.taskItem}>- Evitar sol forte</Text>
            <Text style={styles.taskItem}>- Manter umidade alvo de 60%</Text>
          </View>
        </View>

        {/* ... restante do código da navbar igual ... */}
      </ScrollView>
      {/* ... navbar ... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DFF0DF' },
  scroll: { alignItems: 'center', paddingBottom: 24 },
  center: { justifyContent: 'center', alignItems: 'center' },
  image: {
    width: '92%',
    height: 220,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 8,
    alignSelf: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0F4F3C',
    textAlign: 'center',
    marginVertical: 12,
  },
  photoCard: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  photoIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F7EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  photoIcon: { fontSize: 22 },
  photoCardText: { fontSize: 18, color: '#0F4F3C', fontWeight: '600' },

  tasksCard: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  tasksTitle: { fontSize: 20, fontWeight: '700', color: '#0F4F3C', marginBottom: 8 },
  taskList: { paddingLeft: 4 },
  taskItem: { fontSize: 16, color: '#174C3C', marginBottom: 6 },

  description: { fontSize: 16, color: '#174C3C', width: '92%', marginBottom: 18, textAlign: 'center' },
  aiCard: {
    width: '92%',
    backgroundColor: '#E6F4EA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#0F4F3C',
  },
  aiTitle: { fontWeight: 'bold', color: '#0F4F3C', marginBottom: 4 },
  aiText: { color: '#174C3C' },

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
  navBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  navIcon: { width: 40, height: 40 },
});