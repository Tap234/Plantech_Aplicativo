import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image as RNImage, Platform, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api';
// botão de câmera é invisível — não precisa de ícone

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [identifyResult, setIdentifyResult] = useState<any>(null);
  const [identifyError, setIdentifyError] = useState<string | null>(null);

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
      // identificar automaticamente
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
      // identificar automaticamente
      identifyImage(uri);
    }
  };

  // Envia a imagem para a API de identificação
  const identifyImage = async (uri?: string) => {
    const localUri = uri || imageUri;
    if (!localUri) return;
    try {
      setIdentifying(true);
      // 1) Criar planta temporária para que o backend faça a identificação ao receber a foto
      let plant: any = null;
      const createRes = await api.post('/plantas', { nome: 'Identificando...', descricao: '' });
      plant = createRes.data;

      // 2) Enviar foto para /plantas/{id}/foto (o backend já chama PlantNet e atualiza a planta)
      const fd = new FormData();
      const filename = localUri.split('/').pop() || 'photo.jpg';
      const match = filename.match(/\.([0-9a-z]+)$/i);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      // @ts-ignore
      fd.append('file', { uri: localUri, name: filename, type });

      const uploadRes = await api.post(`/plantas/${plant.id}/foto`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      // 3) Resposta do upload já traz a planta atualizada com identificação (segundo implementação do backend)
      let updatedPlant = uploadRes.data;

      // Se o backend identificou a espécie mas o nome ainda está como 'Identificando...', atualiza o nome
      try {
        const especie = updatedPlant.especieIdentificada;
        const nomeAtual = updatedPlant.nome || '';
        if (especie && (nomeAtual.trim() === '' || nomeAtual.toLowerCase().includes('identificando'))) {
          const putBody = { nome: especie, descricao: updatedPlant.descricao || '' };
          const putRes = await api.put(`/plantas/${updatedPlant.id}`, putBody);
          updatedPlant = putRes.data;
        }
      } catch (e) {
        console.warn('Não foi possível atualizar nome da planta automaticamente', e);
      }

      setIdentifyResult(updatedPlant);
    } catch (error: any) {
      console.error('Erro ao identificar:', error);
      // Se criou planta temporária, remove para não poluir favoritos
      try {
        // @ts-ignore
        if (plant && plant.id) await api.delete(`/plantas/${plant.id}`);
      } catch (e) {
        // ignora erro na exclusão
      }
      // marca erro de identificação (mantém modal aberto)
      setIdentifyError('Não foi possível identificar a imagem');

      // Avisar o usuário e oferecer tirar outra foto — sem fechar o modal
      Alert.alert(
        'Não foi possível identificar a imagem',
        'Deseja tirar outra foto agora?',
        [
          { text: 'Fechar', style: 'cancel', onPress: () => { setModalVisible(false); setImageUri(null); setIdentifyResult(null); setIdentifyError(null); setTimeout(() => router.replace('/'), 250); } },
          { text: 'Tirar outra foto', onPress: () => { /* não fechar modal aqui; apenas abrir a câmera */ setTimeout(() => openCamera(), 200); } },
        ],
        { cancelable: true }
      );
    } finally {
      setIdentifying(false);
    }
  };

  // Salva a planta retornada pela identificação como nova planta do usuário
  const saveAsPlant = async () => {
    if (!identifyResult) {
      Alert.alert('Nada a salvar', 'Faça a identificação antes de salvar.');
      return;
    }

    try {
      // Se já temos um resultado com id, garantimos que a foto do usuário foi enviada
      if (identifyResult && identifyResult.id) {
        // se a planta já possui foto no backend, apenas navegar; caso contrário, envia a foto e pega a resposta
        const hasFoto = identifyResult.fotoUrl || identifyResult.foto || identifyResult.imagemUrl || identifyResult.url;
        if (!hasFoto && imageUri) {
          try {
            const fd = new FormData();
            const filename = imageUri.split('/').pop() || 'photo.jpg';
            const match = filename.match(/\.([0-9a-z]+)$/i);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            // @ts-ignore
            fd.append('file', { uri: imageUri, name: filename, type });
            const uploadRes = await api.post(`/plantas/${identifyResult.id}/foto`, fd);
            // atualizar identifyResult com a resposta do backend
            let updated = uploadRes.data;
            if (updated && !updated.fotoUrl && updated.id) {
              // tentar buscar a planta atualizada se fotoUrl não veio na resposta
              try {
                const fresh = await api.get(`/plantas/${updated.id}`);
                updated = fresh.data || updated;
              } catch (e) {
                // ignora
              }
            }
            if (updated) setIdentifyResult(updated);
          } catch (e: any) {
            console.error('Erro ao enviar foto da planta existente:', e);
            Alert.alert('Erro', 'Não foi possível enviar a foto da planta.');
            return;
          }
        }

        Alert.alert('Adicionado', 'Planta salva nas suas plantas/favoritos.');
        setModalVisible(false);
        setImageUri(null);
        setIdentifyResult(null);
        router.replace('/favoritos');
        return;
      }

      // Caso não exista id (identificação sugerida mas planta não criada), cria planta e anexa foto do usuário
      const nome = identifyResult.especieIdentificada || identifyResult.species || identifyResult.name || 'Planta identificada';
      const descricao = identifyResult.descricao || identifyResult.description || '';

      const createRes = await api.post('/plantas', { nome, descricao });
      let newPlant: any = createRes.data;

      if (imageUri && newPlant && newPlant.id) {
        try {
          const fd = new FormData();
          const filename = imageUri.split('/').pop() || 'photo.jpg';
          const match = filename.match(/\.([0-9a-z]+)$/i);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          // @ts-ignore
          fd.append('file', { uri: imageUri, name: filename, type });
          const uploadRes = await api.post(`/plantas/${newPlant.id}/foto`, fd);
          // atualiza newPlant com resposta do backend (que seta fotoUrl)
          let updated = uploadRes.data;
          if (updated && !updated.fotoUrl && updated.id) {
            try {
              const fresh = await api.get(`/plantas/${updated.id}`);
              updated = fresh.data || updated;
            } catch (e) {
              // ignora
            }
          }
          if (updated) newPlant = updated;
        } catch (e: any) {
          console.error('Erro ao enviar foto da nova planta:', e);
          Alert.alert('Erro', 'Não foi possível enviar a foto da planta.');
          return;
        }
      }

      Alert.alert('Salvo', 'Planta adicionada às suas plantas.');
      setModalVisible(false);
      setImageUri(null);
      setIdentifyResult(null);
      router.replace('/favoritos');
    } catch (error: any) {
      console.error('Erro ao salvar planta:', error);
      Alert.alert('Erro', 'Não foi possível salvar a planta.');
    }
  };

  const handleCameraButton = () => {
    // abre um menu nativo simples perguntando Camera ou Galeria
    Alert.alert('Inserir imagem', 'Escolha a origem da imagem', [
      { text: 'Câmera', onPress: openCamera },
      { text: 'Galeria', onPress: openGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
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
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={handleCameraButton}
          activeOpacity={0.7}
          accessibilityLabel="Abrir câmera ou galeria"
        />
      </View>

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
                style={[modalStyles.primaryBtn, (!identifyResult || (!identifyResult.especieIdentificada && !identifyResult.id)) && modalStyles.disabledBtn]}
                disabled={!identifyResult || (!identifyResult.especieIdentificada && !identifyResult.id) || identifying}
              >
                <Text style={modalStyles.primaryBtnText}>Adicionar aos favoritos</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={async () => {
                // se identificação criou planta temporária, excluir quando fechar sem salvar
                try {
                  if (identifyResult && identifyResult.id) {
                    // apagar planta temporária apenas se o nome for 'Identificando...' ou se quiser forçar remoção
                    if (identifyResult.nome === 'Identificando...' || !identifyResult.nome) {
                      await api.delete(`/plantas/${identifyResult.id}`);
                    }
                  }
                } catch (e) {
                  // ignora falha na exclusão
                }
                setModalVisible(false);
                setImageUri(null);
                setIdentifyResult(null);
                // volta para a tela home após fechar
                setTimeout(() => router.replace('/'), 250);
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
        { paddingBottom: Math.max(insets.bottom, 12), height: 80 + Math.max(insets.bottom, 12) },
      ]}>
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

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6FFF6', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '94%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 6 },
  previewImage: { width: '100%', height: 300, borderRadius: 12, marginBottom: 12 },
  previewPlaceholder: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#EAEAEA', marginBottom: 12 },
  heading: { fontSize: 20, fontWeight: '700', color: '#0F4F3C', alignSelf: 'flex-start', marginBottom: 8 },
  resultRow: { width: '100%', marginBottom: 12 },
  speciesText: { fontSize: 22, fontWeight: '700', color: '#0F4F3C' },
  confidenceText: { fontSize: 14, color: '#174C3C', marginTop: 6 },
  descText: { marginTop: 8, color: '#2F6B55' },
  infoText: { fontSize: 16, color: '#666' },
  errorText: { fontSize: 16, color: '#D9534F', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  actionsRowTwo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 12 },
  primaryBtn: { flex: 1, marginRight: 8, paddingVertical: 14, backgroundColor: '#FF7A3D', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  closeBtn: { flex: 1, marginLeft: 8, paddingVertical: 14, backgroundColor: '#E6E6E6', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#174C3C', fontWeight: '700', fontSize: 16 },
  disabledBtn: { backgroundColor: '#F2B99A', opacity: 0.9 },
});