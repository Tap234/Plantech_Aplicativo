import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image as RNImage,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UsuarioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.name}>Emilia Souza</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.cardRow}>
          <Text style={styles.cardText}>Notificações</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ccc', true: '#7BC79B' }}
            thumbColor={notificationsEnabled ? '#fff' : '#fff'}
          />
        </View>

        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => alert('Excluir plantas favorited - placeholder')}>
          <Text style={styles.cardText}>Excluir plantas favoritas</Text>
          <Text style={styles.icon}>🗑️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => alert('Atualizar cadastro - placeholder')}>
          <Text style={styles.cardText}>Atualizações cadastrais</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={async () => {
            // Confirmação simples
            Alert.alert('Confirmar', 'Deseja sair da conta?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: async () => {
                try {
                  if (Platform.OS === 'web') {
                    localStorage.removeItem('userToken');
                  } else {
                    await SecureStore.deleteItemAsync('userToken');
                  }
                } catch (e) {
                  // ignora
                }
                router.replace('/login');
              } }
            ]);
          }}
        >
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.navbar, { paddingBottom: Math.max(insets.bottom, 12), height: 80 + Math.max(insets.bottom, 12) }]}>
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
  },
  header: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 12,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EAF6EE',
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F4F3C',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  cardRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 18,
    color: '#174C3C',
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
  },
  logoutBtn: {
    backgroundColor: '#E76A4A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
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
