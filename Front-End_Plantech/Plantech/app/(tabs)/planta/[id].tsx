import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image as RNImage,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../api';

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
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar planta');
      router.back();
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

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#0F4F3C" /></View>;
  }

  if (!plant) return null;

  const uploadsBase = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '/uploads') : 'http://localhost:8080/uploads';
  const fotoField = plant.fotoUrl || plant.foto || plant.imagemUrl || plant.url || null;
  const imageUri = fotoField ? `${uploadsBase}/${fotoField}` : null;

  const isWateringDay = plant.proximaRega ? new Date(plant.proximaRega).toDateString() === new Date().toDateString() : false;
  const isLate = plant.proximaRega ? new Date(plant.proximaRega) < new Date() : false;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <RNImage
            source={imageUri ? { uri: imageUri } : require('../../../assets/images/PlanTech.png')}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>{plant.nome}</Text>
            <Text style={styles.subtitle}>{plant.especieIdentificada || 'Espécie não identificada'}</Text>

            {/* STATUS DE SAÚDE */}
            <View style={styles.healthBadge}>
              <Text style={styles.healthText}>
                {plant.estadoSaude === 'Doente' ? '🤒 Precisa de Cuidados' :
                  plant.estadoSaude === 'Em Recuperação' ? '❤️‍🩹 Em Recuperação' :
                    '🌿 Saudável'}
              </Text>
            </View>
          </View>
        </View>

        {/* ALERTA CLIMÁTICO (SÓ SE EXISTIR) */}
        {plant.recomendacaoClimatica && (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>⚠️ Alerta Climático</Text>
            <Text style={styles.alertText}>{plant.recomendacaoClimatica}</Text>
          </View>
        )}

        {/* AÇÕES DO DIA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Ações de Hoje</Text>

          {/* 1. RECOMENDAÇÃO DIÁRIA */}
          <View style={styles.card}>
            <Text style={styles.cardText}>{plant.recomendacaoDiaria || "Nenhuma recomendação específica para hoje."}</Text>

            {!plant.acaoDiariaRealizada && (
              <TouchableOpacity style={styles.actionBtn} onPress={async () => {
                await api.post(`/plantas/${id}/check-diario`);
                loadPlant();
              }}>
                <Text style={styles.actionBtnText}>✅ Marcar como Lido</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 2. REGA (SE FOR O DIA OU ESTIVER ATRASADO) */}
          {(isWateringDay || isLate) && (
            <View style={[styles.card, styles.waterCard]}>
              <Text style={styles.waterTitle}>💧 Hora de Regar!</Text>
              <Text style={styles.waterText}>
                {isLate ? 'Você esqueceu de regar!' : 'Mantenha sua planta hidratada.'}
              </Text>
              <TouchableOpacity style={styles.waterBtn} onPress={handleWatering}>
                <Text style={styles.waterBtnText}>Já Reguei</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* MONITORAMENTO (FOTO DE CONTROLE) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Monitoramento</Text>
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={handlePhotoUpload}
            disabled={sendingPhoto}
          >
            <Text style={styles.photoBtnIcon}>📷</Text>
            <View>
              <Text style={styles.photoBtnTitle}>Enviar Foto de Controle</Text>
              <Text style={styles.photoBtnSub}>
                {plant.proximaFotoControle
                  ? `Próxima: ${new Date(plant.proximaFotoControle).toLocaleDateString('pt-BR')}`
                  : 'Ajude a IA a acompanhar a evolução'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* INFO GERAL */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Próxima Rega</Text>
            <Text style={styles.infoValue}>
              {plant.proximaRega ? new Date(plant.proximaRega).toLocaleDateString('pt-BR') : '-'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Frequência</Text>
            <Text style={styles.infoValue}>{plant.frequenciaRegaDias} dias</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F9F4' },
  scroll: { paddingBottom: 40 },
  center: { justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center'
  },
  image: {
    width: '100%',
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    marginTop: -40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: '85%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1B4332' },
  subtitle: { fontSize: 16, color: '#52B788', marginBottom: 8, fontStyle: 'italic' },
  healthBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4
  },
  healthText: { color: '#2D6A4F', fontWeight: '600' },

  alertCard: {
    margin: 20,
    backgroundColor: '#FFF3CD',
    borderColor: '#FFECB5',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
  },
  alertTitle: { color: '#856404', fontWeight: 'bold', marginBottom: 4 },
  alertText: { color: '#856404' },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B4332', marginBottom: 12 },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: { fontSize: 15, color: '#444', lineHeight: 22 },
  actionBtn: {
    marginTop: 12,
    backgroundColor: '#52B788',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },

  waterCard: { backgroundColor: '#E0F7FA' },
  waterTitle: { fontSize: 16, fontWeight: 'bold', color: '#006064', marginBottom: 4 },
  waterText: { color: '#00838F', marginBottom: 12 },
  waterBtn: { backgroundColor: '#00ACC1', padding: 10, borderRadius: 8, alignItems: 'center' },
  waterBtnText: { color: '#fff', fontWeight: 'bold' },

  photoBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  photoBtnIcon: { fontSize: 24, marginRight: 16 },
  photoBtnTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B4332' },
  photoBtnSub: { fontSize: 13, color: '#888' },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24
  },
  infoItem: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: { fontSize: 14, color: '#888', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#1B4332' }
});