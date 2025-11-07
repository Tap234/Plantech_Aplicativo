import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  Text, 
  Alert, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform // 1. IMPORTAR O PLATFORM
} from 'react-native';
import { router } from 'expo-router';
import api from '../api';
import * as SecureStore from 'expo-secure-store';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o email e a senha.');
      return;
    }

    try {
      console.log('Tentando login com:', email);
      const response = await api.post('/login', { //
        username: email,
        password: password,
      }); //

      // 2. MODIFICAR A FORMA DE SALVAR O TOKEN
      if (response.data && response.data.token) {
        
        if (Platform.OS === 'web') {
          // Se for web, usa o localStorage
          localStorage.setItem('userToken', response.data.token);
        } else {
          // Se for nativo, usa o SecureStore
          await SecureStore.setItemAsync('userToken', response.data.token);
        }

        console.log('Token salvo com sucesso!');
      } else {
        console.warn('Resposta de login não continha um token.');
        Alert.alert('Erro', 'Ocorreu um problema no login, resposta inesperada do servidor.');
        return;
      }

      console.log('Login bem-sucedido:', response.data);
      Alert.alert('Login realizado com sucesso!');
      
      setEmail('');
      setPassword('');

      router.replace('/(tabs)'); //

    } catch (error) {
      console.error('Falha no login:', error);
      Alert.alert('Falha no login', 'Email ou senha inválidos.');
    }
  };

  // ... (O restante do return e styles permanece o mesmo)
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email (usuário)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} color="#fff" />
      </View>
    </KeyboardAvoidingView>
  );
};

// ... (styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5ff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    width: '90%',
    backgroundColor: '#007BFF',
    borderRadius: 8,
    marginTop: 10,
    overflow: 'hidden',
  },
});

export default LoginScreen;