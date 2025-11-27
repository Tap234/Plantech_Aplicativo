import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image as RNImage,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../api';
import * as SecureStore from 'expo-secure-store';

export default function PlantaDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const [plant, setPlant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingPhoto, setSendingPhoto] = useState(false);

  useEffect(() => {
    loadPlant();
  }, [id]);

  async function loadPlant() {
    try {
      setLoading(true);
      const res = await api.get(`/plantas/${id}`);
      setPlant(res.data);
    } catch (error: any) {
      console.error('Erro ao carregar planta:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert('Sessão Expirada', 'Por favor, faça login novamente.');
        if (Platform.OS === 'web') {
          localStorage.removeItem('userToken');
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
        router.replace('/login');
      } else {
        Alert.alert('Erro', 'Erro ao carregar planta');
        router.back();
      }
    } finally {
      setLoading(false);
    }
  }

  const handlePhotoUpload = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos da câmera para analisar a saúde da planta.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;

      try {
        setSendingPhoto(true);
        const fd = new FormData();
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = filename.match(/\.([0-9a-z]+)$/i);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        // @ts-ignore
        fd.append('file', { uri: uri, name: filename, type });

        await api.post(`/plantas/${id}/foto-controle`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        Alert.alert('Sucesso', 'Análise enviada! A IA está processando a evolução.');
        loadPlant();

      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao enviar a foto.');
      } finally {
        setSendingPhoto(false);
      }
    }
  };

  const handleWatering = async () => {
    try {
      await api.post(`/plantas/${id}/regar`);
      Alert.alert('Sucesso', 'Rega registrada! A frequência será ajustada se necessário.');
      loadPlant();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao registrar rega.');
    }
  };

  const handleMarkAsDone = async () => {
    try {
      await api.post(`/plantas/${id}/check-diario`);
      loadPlant();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao marcar como feito.');
    }
  };

  const pickControlPhoto = handlePhotoUpload; // Alias para consistência

  if (loading) {
    return <View style={[styles.container, styles.loadingContainer]}><ActivityIndicator size="large" color="#0F4F3C" /></View>;
  }

  if (!plant) return null;

  const uploadsBase = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '/uploads') : 'http://localhost:8080/uploads';
  const fotoField = plant.fotoUrl || plant.foto || plant.imagemUrl || plant.url || null;
  const imageUri = fotoField ? `${uploadsBase}/${fotoField}` : null;

  // Verifica se é dia de rega (comparando datas)
  const todayStr = new Date().toDateString();
  const regaDate = plant.proximaRega ? new Date(plant.proximaRega) : null;
  const isWateringDay = regaDate ? regaDate.toDateString() === todayStr : false;
  const isLate = regaDate ? regaDate < new Date() && regaDate.toDateString() !== todayStr : false;

  // Verifica se é dia de foto de controle
  const fotoDate = plant.proximaFotoControle ? new Date(plant.proximaFotoControle) : null;
  const isPhotoDay = fotoDate ? new Date() >= fotoDate : false;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <RNImage
          source={imageUri ? { uri: imageUri } : require('../../../assets/images/PlanTech.png')}
          style={styles.plantImage}
          resizeMode="cover"
        />
        <Text style={styles.plantName}>{plant.nome}</Text>
        <Text style={styles.plantSpecies}>{plant.especieIdentificada || 'Espécie não identificada'}</Text>

        {/* STATUS DE SAÚDE */}
        <View style={[styles.healthBadge, { backgroundColor: plant.estadoSaude === 'Doente' ? '#FFCDD2' : plant.estadoSaude === 'Em Recuperação' ? '#FFF9C4' : '#C8E6C9' }]}>
          <Text style={[styles.healthText, { color: plant.estadoSaude === 'Doente' ? '#C62828' : plant.estadoSaude === 'Em Recuperação' ? '#FBC02D' : '#2E7D32' }]}>
            {plant.estadoSaude === 'Doente' ? '🤒 Precisa de Cuidados' :
              plant.estadoSaude === 'Em Recuperação' ? '❤️‍🩹 Em Recuperação' :
                '🌿 Saudável'}
          </Text>
        </View>
      </View>

      {/* 2. Alerta Climático (SEMPRE EXIBIR SE HOUVER MENSAGEM) */}
      {plant.recomendacaoClimatica && (
        <View style={[styles.card, plant.alertaClimatico ? styles.weatherCardAlert : styles.weatherCardOk]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {plant.alertaClimatico ? '⚠️ Alerta Climático' : '☀️ Condição Climática'}
            </Text>
          </View>
          <Text style={styles.cardText}>{plant.recomendacaoClimatica}</Text>
        </View>
      )}

      {/* 3. Ações de Hoje (Dica do Dia) */}
      {plant.recomendacaoDiaria && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ações de Hoje</Text>
          </View>
          <View style={[styles.card, styles.dailyCard, plant.acaoDiariaRealizada && styles.dailyCardDone]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Dica do Dia</Text>
              {plant.acaoDiariaRealizada && <Text style={styles.doneBadge}>✅ Concluído</Text>}
            </View>
            <Text style={styles.cardText}>{plant.recomendacaoDiaria}</Text>

            {!plant.acaoDiariaRealizada && (
              <TouchableOpacity style={styles.checkButton} onPress={handleMarkAsDone}>
                <Text style={styles.checkButtonText}>Marcar como Feito</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* Card de Rega (Sempre visível, entre Ações e Monitoramento) */}
      <View style={[styles.card, styles.actionCard, isLate && styles.lateCard]}>
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: isWateringDay || isLate ? '#E0F7FA' : '#F1F8E9' }]}>
            <RNImage source={require('../../../assets/images/Icone_Agua.png')} style={styles.actionIcon} resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.actionTitle}>
              {isLate ? 'Atrasado!' : isWateringDay ? 'Hora de Regar!' : 'Próxima Rega'}
            </Text>
            <Text style={styles.actionDesc}>
              {isLate ? 'Você esqueceu de regar ontem!' :
                isWateringDay ? 'Mantenha sua planta hidratada.' :
                  plant.proximaRega ? new Date(plant.proximaRega).toLocaleDateString('pt-BR') : '--/--/----'}
            </Text>
            <Text style={styles.frequencyText}>
              Frequência: a cada {plant.frequenciaRegaDias} dias
            </Text>
          </View>
        </View>

        {(isWateringDay || isLate) && (
          <TouchableOpacity style={styles.actionButton} onPress={handleWatering}>
            <Text style={styles.actionButtonText}>Já Reguei</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 4. Monitoramento */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Monitoramento</Text>
      </View>

      <View style={[styles.card, styles.monitorCard]}>
        <Text style={styles.monitorText}>
          Próxima foto de controle: <Text style={styles.boldText}>
            {plant.proximaFotoControle
              ? new Date(plant.proximaFotoControle).toLocaleDateString('pt-BR')
              : 'Em breve'}
          </Text>
        </Text>

        {isPhotoDay ? (
          <TouchableOpacity style={styles.photoButton} onPress={pickControlPhoto}>
            <Text style={styles.photoButtonText}>📷 Ajude a acompanhar a evolução</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.waitText}>Aguarde a data para enviar nova foto.</Text>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFAF6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4 },
  plantImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  plantName: { fontSize: 24, fontWeight: 'bold', color: '#174C3C', textAlign: 'center' },
  plantSpecies: { fontSize: 16, color: '#2F6B55', marginBottom: 8, fontStyle: 'italic' },
  healthBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 4 },
  healthText: { fontWeight: 'bold', fontSize: 14 },
  sectionHeader: { paddingHorizontal: 20, marginTop: 24, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#174C3C' },
  card: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 20, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  weatherCardAlert: { backgroundColor: '#FFF5F5', borderLeftWidth: 6, borderLeftColor: '#EF5350' },
  weatherCardOk: { backgroundColor: '#F1F8E9', borderLeftWidth: 6, borderLeftColor: '#66BB6A' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#174C3C' },
  cardText: { fontSize: 15, color: '#555', lineHeight: 24 },
  actionCard: { flexDirection: 'column' },
  lateCard: { borderColor: '#EF5350', borderWidth: 1.5 },
  cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 56, height: 56, backgroundColor: '#E0F7FA', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  actionIcon: { width: 28, height: 28 },
  textContainer: { flex: 1 },
  actionTitle: { fontSize: 18, fontWeight: '700', color: '#006064' },
  actionDesc: { fontSize: 14, color: '#666', marginTop: 2 },
  frequencyText: { fontSize: 13, color: '#888', marginTop: 4, fontStyle: 'italic' },
  actionButton: { backgroundColor: '#26A69A', paddingVertical: 14, borderRadius: 16, alignItems: 'center', shadowColor: '#26A69A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dailyCard: { backgroundColor: '#FFF8E1', borderLeftWidth: 6, borderLeftColor: '#FFA726' },
  dailyCardDone: { backgroundColor: '#F1F8E9', borderLeftColor: '#66BB6A' },
  doneBadge: { fontSize: 14, color: '#2E7D32', fontWeight: 'bold' },
  checkButton: { marginTop: 16, backgroundColor: '#FFA726', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  checkButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  monitorCard: { borderLeftWidth: 6, borderLeftColor: '#174C3C' },
  monitorText: { fontSize: 16, color: '#333', marginBottom: 16 },
  boldText: { fontWeight: 'bold', color: '#174C3C' },
  photoButton: { backgroundColor: '#174C3C', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  photoButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  waitText: { fontSize: 14, color: '#888', fontStyle: 'italic', textAlign: 'center' },
});