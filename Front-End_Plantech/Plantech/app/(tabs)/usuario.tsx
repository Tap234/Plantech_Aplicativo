import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image as RNImage,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../api';

export default function UsuarioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (error: any) {
      console.error('Erro ao carregar usuário:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        // Token inválido ou expirado
        if (Platform.OS === 'web') {
          localStorage.removeItem('userToken');
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          if (Platform.OS === 'web') {
            localStorage.removeItem('userToken');
          } else {
            await SecureStore.deleteItemAsync('userToken');
          }
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#174C3C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.nome || 'Usuário'}</Text>
          <Text style={styles.email}>{user?.email || 'email@exemplo.com'}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferências</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardText}>Notificações</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                  thumbColor={notificationsEnabled ? '#2E7D32' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Em breve', 'Edição de perfil em desenvolvimento.')}>
              <Text style={styles.cardText}>Editar Perfil</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Em breve', 'Configurações em desenvolvimento.')}>
              <Text style={styles.cardText}>Configurações</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.navbar, { paddingBottom: Math.max(insets.bottom, 12), height: 65 + Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/')}>
          <RNImage source={require('../../assets/images/Icone_Home.png')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/favoritos')}>
          <RNImage source={require('../../assets/images/Icone_Favoritos.png')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/usuario')}>
          <RNImage source={require('../../assets/images/Icone_Usuario.png')} style={[styles.navIcon, { tintColor: '#174C3C' }]} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFAF6' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 30, backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#00695C' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#174C3C', marginBottom: 4 },
  email: { fontSize: 16, color: '#666' },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#174C3C', marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  cardText: { fontSize: 16, color: '#333', fontWeight: '500' },
  arrow: { fontSize: 20, color: '#ccc', fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#FFEBEE', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: 'bold' },
  navbar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 8, paddingHorizontal: 16 },
  navBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  navIcon: { width: 32, height: 32, opacity: 0.8 },
});
