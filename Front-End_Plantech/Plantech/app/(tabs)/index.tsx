import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Modal, ActivityIndicator, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as RNImage } from 'react-native';
import api from '../../api';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [identifyResult, setIdentifyResult] = useState<any>(null);
  const [identifyError, setIdentifyError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.nome) {
        setUserName(res.data.nome.split(' ')[0]);
      }
    } catch (error) {
      // Silently fail if user not loaded or not logged in
    }
  }

  // Pede permissões e abre a câmera
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o uso da câmera nas configurações.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setModalVisible(true);
      identifyImage(uri);
    }
  };

  // Pede permissões e abre a galeria
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setModalVisible(true);
      identifyImage(uri);
    }
  };

  // Envia a imagem para a API de identificação
  const identifyImage = async (uri?: string) => {
    const localUri = uri || imageUri;
    if (!localUri) return;

    try {
      setIdentifying(true);
      setIdentifyError(null);

      const fd = new FormData();
      const filename = localUri.split('/').pop() || 'photo.jpg';
      const match = filename.match(/\.([0-9a-z]+)$/i);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      // @ts-ignore
      fd.append('file', { uri: localUri, name: filename, type });

      const res = await api.post('/plantas/identificar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const result = res.data;

      setIdentifyResult({ ...result, uri: localUri });

    } catch (error: any) {
      console.error('Erro ao identificar:', error);
      setIdentifyError('Não foi possível identificar a imagem');
    } finally {
      setIdentifying(false);
    }
  };

  const saveAsPlant = async () => {
    if (!identifyResult) return;

    try {
      setIdentifying(true);

      let locationData = { latitude: null, longitude: null };
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          // @ts-ignore
          locationData.latitude = loc.coords.latitude;
          // @ts-ignore
          locationData.longitude = loc.coords.longitude;
        }
      } catch (e) {
        console.warn('Erro ao obter localização:', e);
      }

      const body = {
        nome: identifyResult.especieIdentificada || 'Minha Planta',
        descricao: 'Identificada automaticamente',
        fotoTemp: identifyResult.fotoTemp,
        especieIdentificada: identifyResult.especieIdentificada,
        probabilidadeIdentificacao: identifyResult.probabilidadeIdentificacao,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      };

      await api.post('/plantas/confirmar', body);

      setModalVisible(false);
      setImageUri(null);
      setIdentifyResult(null);
      router.replace('/favoritos');

    } catch (error) {
      console.error('Erro ao salvar planta:', error);
      Alert.alert('Erro', 'Não foi possível salvar a planta.');
    } finally {
      setIdentifying(false);
    }
  };

  const handleCameraButton = () => {
    Alert.alert('Identificar Planta', 'Escolha uma opção', [
      { text: 'Tirar Foto', onPress: openCamera },
      { text: 'Escolher da Galeria', onPress: openGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {userName || 'Amante de Plantas'}</Text>
            <Text style={styles.subtitle}>Vamos cuidar do seu jardim?</Text>
          </View>
        </View>

        {/* Main Action Card */}
        <TouchableOpacity style={styles.mainCard} onPress={handleCameraButton} activeOpacity={0.9}>
          <View style={styles.mainCardContent}>
            <Text style={styles.mainCardTitle}>Identificar Planta</Text>
            <Text style={styles.mainCardDesc}>Tire uma foto para descobrir a espécie e cuidados.</Text>
            <View style={styles.cameraIconContainer}>
              <Feather name="camera" size={32} color="#fff" />
            </View>
          </View>
          <RNImage source={require('../../assets/images/Scanner.png')} style={styles.mainCardImage} resizeMode="cover" />
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/favoritos')}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
              <Feather name="heart" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.actionText}>Favoritos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/explore')}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Feather name="compass" size={24} color="#1565C0" />
            </View>
            <Text style={styles.actionText}>Explorar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Dica', 'Regue suas plantas pela manhã para evitar fungos.')}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
              <Feather name="sun" size={24} color="#EF6C00" />
            </View>
            <Text style={styles.actionText}>Dicas</Text>
          </TouchableOpacity>
        </View>

        {/* Recent/Tips Section Placeholder */}
        <View style={styles.tipCard}>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Você sabia?</Text>
            <Text style={styles.tipText}>Plantas purificam o ar e melhoram o humor. Mantenha seu jardim saudável!</Text>
          </View>
          <Feather name="smile" size={40} color="#A5D6A7" style={{ opacity: 0.8 }} />
        </View>

      </ScrollView>

      {/* Modal de preview / identificação */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={modalStyles.container}>
          <View style={modalStyles.card}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={modalStyles.previewImage} />
            ) : (
              <View style={modalStyles.previewPlaceholder} />
            )}

            <Text style={modalStyles.heading}>Identificação</Text>

            <View style={modalStyles.resultRow}>
              {identifying ? (
                <ActivityIndicator size="large" color="#0F4F3C" />
              ) : identifyError ? (
                <Text style={modalStyles.errorText}>{identifyError}</Text>
              ) : identifyResult ? (
                <>
                  <Text style={modalStyles.speciesText}>{identifyResult.especieIdentificada || identifyResult.species || identifyResult.nome || 'Indefinido'}</Text>
                  {identifyResult.probabilidadeIdentificacao != null && (
                    <Text style={modalStyles.confidenceText}>Confiança: {(identifyResult.probabilidadeIdentificacao * 100).toFixed(1)}%</Text>
                  )}
                  {identifyResult.descricao && <Text style={modalStyles.descText}>{identifyResult.descricao}</Text>}
                </>
              ) : (
                <Text style={modalStyles.infoText}>Enviando imagem e identificando...</Text>
              )}
            </View>

            <View style={modalStyles.actionsRowTwo}>
              <TouchableOpacity
                onPress={saveAsPlant}
                style={[modalStyles.primaryBtn, (!identifyResult || (!identifyResult.especieIdentificada && !identifyResult.fotoTemp)) && modalStyles.disabledBtn]}
                disabled={!identifyResult || (!identifyResult.especieIdentificada && !identifyResult.fotoTemp) || identifying}
              >
                <Text style={modalStyles.primaryBtnText}>Adicionar aos favoritos</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setImageUri(null);
                setIdentifyResult(null);
              }} style={modalStyles.closeBtn}>
                <Text style={modalStyles.closeBtnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Navbar */}
      <View style={[
        styles.navbar,
        { paddingBottom: Math.max(insets.bottom, 12), height: 65 + Math.max(insets.bottom, 12) },
      ]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/')}>
          <RNImage source={require('../../assets/images/Icone_Home.png')} style={[styles.navIcon, { tintColor: '#174C3C' }]} resizeMode="contain" />
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
    backgroundColor: '#FCFAF6',
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#174C3C',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIcon: {
    width: 24,
    height: 24,
    opacity: 0.8,
  },
  mainCard: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    backgroundColor: '#174C3C',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 32,
    shadowColor: '#174C3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainCardImage: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 180,
    height: 180,
    opacity: 0.4,
    transform: [{ rotate: '-15deg' }],
  },
  mainCardContent: {
    padding: 24,
    height: '100%',
    justifyContent: 'center',
    zIndex: 2,
  },
  mainCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    maxWidth: '70%',
  },
  mainCardDesc: {
    fontSize: 14,
    color: '#E0F2F1',
    maxWidth: '65%',
    marginBottom: 16,
    lineHeight: 20,
  },
  cameraIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#174C3C',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tipContent: {
    flex: 1,
    marginRight: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#174C3C',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    width: 32,
    height: 32,
    opacity: 0.8,
  },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '94%', backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 10 },
  previewImage: { width: '100%', height: 300, borderRadius: 16, marginBottom: 16 },
  previewPlaceholder: { width: '100%', height: 300, borderRadius: 16, backgroundColor: '#EAEAEA', marginBottom: 16 },
  heading: { fontSize: 22, fontWeight: '700', color: '#0F4F3C', alignSelf: 'flex-start', marginBottom: 12 },
  resultRow: { width: '100%', marginBottom: 16 },
  speciesText: { fontSize: 24, fontWeight: '700', color: '#0F4F3C' },
  confidenceText: { fontSize: 16, color: '#174C3C', marginTop: 6, fontWeight: '500' },
  descText: { marginTop: 8, color: '#555', lineHeight: 22 },
  infoText: { fontSize: 16, color: '#666' },
  errorText: { fontSize: 16, color: '#D9534F', fontWeight: '600' },
  actionsRowTwo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  primaryBtn: { flex: 1, marginRight: 8, paddingVertical: 16, backgroundColor: '#174C3C', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  closeBtn: { flex: 1, marginLeft: 8, paddingVertical: 16, backgroundColor: '#F5F5F5', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#333', fontWeight: '700', fontSize: 16 },
  disabledBtn: { backgroundColor: '#A5D6A7', opacity: 0.8 },
});