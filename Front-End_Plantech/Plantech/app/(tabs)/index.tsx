import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image as RNImage, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Função para abrir a câmera (placeholder)
  const handleOpenCamera = () => {
    // Aqui você pode integrar o expo-camera ou outro pacote
    alert('Abrir câmera!');
  };

  return (
    <View style={styles.container}>
      {/* Logo + texto */}
      <View style={styles.logoContainer}>
        <RNImage source={require('../../assets/images/PlanTech.png')} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Texto de instrução (parte superior) */}
      <Text style={styles.instructionText}>Escaneie sua planta</Text>

      {/* Scanner com botão de câmera (ocupa a maior parte da tela) */}
      <View style={styles.scannerContainer}>
        <RNImage source={require('../../assets/images/Scanner.png')} style={styles.scannerImg} resizeMode="cover" />
        <TouchableOpacity style={styles.cameraBtn} onPress={handleOpenCamera} activeOpacity={0.7}>
          {/* Área clicável sobre o ícone da câmera */}
        </TouchableOpacity>
      </View>

      {/* Navbar */}
      <View style={[
        styles.navbar,
        { paddingBottom: Math.max(insets.bottom, 12), height: 80 + Math.max(insets.bottom, 12) },
      ]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/')}>
          <RNImage source={require('../../assets/images/Icone_Home.png')} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/explore')}>
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
    backgroundColor: '#FCFAF6',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 6,
  },
  logoText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#174C3C',
    letterSpacing: -2,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'sans-serif',
  },
  welcome: {
    fontSize: 28,
    color: '#174C3C',
    fontWeight: '500',
    marginBottom: 18,
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    maxWidth: 900,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 110,
    position: 'relative',
  },
  scannerImg: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  instructionText: {
    marginTop: 8,
    alignSelf: 'center',
    fontSize: 22,
    color: '#174C3C',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  cameraBtn: {
    position: 'absolute',
    left: '50%',
    bottom: '12%',
    transform: [{ translateX: -32 }],
    width: 64,
    height: 64,
    borderRadius: 32,
    zIndex: 2,
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