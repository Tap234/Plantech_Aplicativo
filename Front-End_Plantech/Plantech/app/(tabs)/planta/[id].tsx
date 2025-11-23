import React from 'react';
import { View, Text, StyleSheet, Image as RNImage, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PlantaDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const id = params.id as string | undefined;

  // Placeholder data; later will be fetched from backend by `id`
  const plant = {
    id: id ?? '0',
    name: 'Monstera',
    tasks: [
      'Regar com 300 ml',
      'Adubo NPK leve',
      'Evitar sol forte',
      'Manter umidade alvo de 60%',
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <RNImage source={require('../../../assets/images/PlanTech.png')} style={styles.image} resizeMode="cover" />

        <Text style={styles.title}>{plant.name}</Text>

        <TouchableOpacity style={styles.pill} activeOpacity={0.8} onPress={() => alert('Abrir galeria de fotos')}>
          <View style={styles.pillIcon}>
            <Text style={styles.pillIconText}>📷</Text>
          </View>
          <Text style={styles.pillText}>Fotos de controle</Text>
        </TouchableOpacity>

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Tarefas de hoje</Text>
          {plant.tasks.map((t, i) => (
            <Text style={styles.taskItem} key={i}>- {t}</Text>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.navbar, { paddingBottom: Math.max(insets.bottom, 12), height: 80 + Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/')}>
          <RNImage source={require('../../../assets/images/Icone_Home.png')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/favoritos')}>
          <RNImage source={require('../../../assets/images/Icone_Favoritos.png')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/login')}>
          <RNImage source={require('../../../assets/images/Icone_Usuario.png')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DFF0DF',
  },
  scroll: {
    paddingTop: 32,
    alignItems: 'center',
    paddingBottom: 24,
  },
  image: {
    width: '86%',
    height: 220,
    borderRadius: 16,
    marginBottom: 18,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F4F3C',
    marginBottom: 18,
  },
  pill: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  pillIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pillIconText: {
    fontSize: 20,
  },
  pillText: {
    fontSize: 20,
    color: '#174C3C',
    fontWeight: '600',
  },
  taskCard: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#174C3C',
    marginBottom: 8,
  },
  taskItem: {
    fontSize: 16,
    color: '#174C3C',
    marginBottom: 6,
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
