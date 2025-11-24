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
import * as ImagePicker from 'expo-image-picker'; // Import necessário
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

  // --- LÓGICA DE UPLOAD DA FOTO DE CONTROLE (Conectado ao Backend) ---
  const handlePhotoUpload = async () => {
    // 1. Pedir permissão
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos da câmera para analisar a saúde da planta.');
      return;
    }

    // 2. Abrir Câmera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      
      try {
        setSendingPhoto(true);
        
        // 3. Preparar o arquivo para envio (FormData)
        const fd = new FormData();
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = filename.match(/\.([0-9a-z]+)$/i);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        // @ts-ignore: O React Native aceita esse formato no FormData
        fd.append('file', { uri: uri, name: filename, type });

        // 4. Enviar para o endpoint de MONITORAMENTO (e não o de cadastro)
        await api.post(`/plantas/${id}/foto-controle`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        Alert.alert('Sucesso', 'Análise de saúde enviada! O histórico foi atualizado.');
        loadPlant(); // Recarrega para atualizar dados da planta se necessário

      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao enviar a foto para análise.');
      } finally {
        setSendingPhoto(false);
      }
    }
  };

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#0F4F3C" /></View>;
  }

  if (!plant) return null;

  // URL da foto principal da planta
  const uploadsBase = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '/uploads') : 'http://localhost:8080/uploads';
  const fotoField = plant.fotoUrl || plant.foto || plant.imagemUrl || plant.url || null;
  const imageUri = fotoField ? `${uploadsBase}/${fotoField}` : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* FOTO DA PLANTA */}
        <RNImage
          source={imageUri ? { uri: imageUri } : require('../../../assets/images/PlanTech.png')}
          style={styles.image}
          resizeMode="cover"
        />

        <Text style={styles.title}>{plant.nome}</Text>
        <Text style={styles.subtitle}>{plant.especieIdentificada || 'Espécie não identificada'}</Text>

        {/* BOTÃO DE FOTO DE CONTROLE (SAÚDE) */}
        <TouchableOpacity 
          style={styles.photoCard} 
          activeOpacity={0.85} 
          onPress={handlePhotoUpload}
          disabled={sendingPhoto}
        >
          <View style={styles.photoIconWrap}>
            {sendingPhoto ? <ActivityIndicator color="#0F4F3C" /> : <Text style={styles.photoIcon}>📷</Text>}
          </View>
          <Text style={styles.photoCardText}>
            {sendingPhoto ? 'Enviando...' : 'Nova Foto de Controle'}
          </Text>
        </TouchableOpacity>

        {/* CARD DE RECOMENDAÇÃO DIÁRIA (GERADA PELO JOB) */}
        <View style={styles.tasksCard}>
          <Text style={styles.tasksTitle}>📅 Recomendação de Hoje</Text>
          
          {plant.recomendacaoDiaria ? (
             <>
               <Text style={styles.taskItem}>{plant.recomendacaoDiaria}</Text>
               
               {/* Botão de Check Diário */}
               {!plant.acaoDiariaRealizada ? (
                 <TouchableOpacity 
                   style={styles.checkBtn} 
                   onPress={async () => {
                      try {
                        await api.post(`/plantas/${id}/check-diario`);
                        Alert.alert("Sucesso", "Registrado! A IA aprenderá com isso.");
                        loadPlant(); 
                      } catch (e) { Alert.alert("Erro", "Erro ao registrar ação."); }
                   }}
                 >
                   <Text style={styles.checkBtnText}>✅ Marcar como Feito</Text>
                 </TouchableOpacity>
               ) : (
                 <Text style={styles.doneText}>Tarefa de hoje concluída! 🎉</Text>
               )}
             </>
          ) : (
             <Text style={styles.aiText}>Aguardando análise diária da IA...</Text>
          )}
        </View>

        {/* INFORMAÇÕES EXTRAS */}
        <View style={styles.infoCard}>
           <Text style={styles.infoLabel}>Próxima Rega Estimada:</Text>
           <Text style={styles.infoValue}>
             {plant.proximaRega ? new Date(plant.proximaRega).toLocaleDateString('pt-BR') : 'Calculando...'}
           </Text>
        </View>

      </ScrollView>
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
    fontSize: 32,
    fontWeight: '700',
    color: '#0F4F3C',
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#2F6B55',
    textAlign: 'center',
    marginBottom: 18,
    fontStyle: 'italic'
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
  tasksTitle: { fontSize: 20, fontWeight: '700', color: '#0F4F3C', marginBottom: 12 },
  taskItem: { fontSize: 16, color: '#174C3C', marginBottom: 12, lineHeight: 22 },
  
  checkBtn: {
    backgroundColor: '#7BC79B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 5
  },
  checkBtnText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16
  },
  doneText: { 
    marginTop: 8, 
    color: '#2D6A4F', 
    fontStyle: 'italic',
    fontWeight: '600',
    fontSize: 16
  },
  aiText: { 
    color: '#666', 
    fontStyle: 'italic',
    fontSize: 14
  },
  
  infoCard: {
    width: '92%',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoLabel: { fontSize: 16, color: '#2F6B55' },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#0F4F3C' }
});