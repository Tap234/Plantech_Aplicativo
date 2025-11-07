import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  Text, 
  Alert, 
  StyleSheet, // Importe o StyleSheet
  KeyboardAvoidingView, // Para o teclado não cobrir os inputs
  Platform // Para ajustar o comportamento por plataforma
} from 'react-native';
import { router } from 'expo-router';
import api from '../api'; //

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
      const response = await api.post('/login', { // Seu backend espera 'username' e 'password'
        username: email,
        password: password,
      });

      // IMPORTANTE: Você precisa salvar o token!
      // Por enquanto, vamos apenas navegar
      console.log('Login bem-sucedido:', response.data);
      Alert.alert('Login realizado com sucesso!');
      
      // Limpa os campos após o login
      setEmail('');
      setPassword('');

      router.replace('/(tabs)'); // Navega para a home

    } catch (error) {
      console.error('Falha no login:', error);
      Alert.alert('Falha no login', 'Email ou senha inválidos.');
    }
  };

  return (
    // KeyboardAvoidingView ajuda a tela a se ajustar quando o teclado aparece
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input} // Aplica o estilo
        placeholder="Email (usuário)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input} // Aplica o estilo
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Adicionei um View para estilizar o botão (Button é difícil de estilizar) */}
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} color="#fff" />
      </View>
    </KeyboardAvoidingView>
  );
};

// --- A MÁGICA ACONTECE AQUI ---
const styles = StyleSheet.create({
  container: {
    flex: 1, // Faz o container ocupar a tela inteira
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    padding: 20, // Dá um respiro nas laterais
    backgroundColor: '#f5f5f5', // Um fundo suave
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40, // Espaço abaixo do título
    color: '#333',
  },
  input: {
    width: '90%', // Ocupa 90% da largura da tela
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15, // --- ISSO EMPILHA OS INPUTS ---
    fontSize: 16,
  },
  buttonContainer: {
    width: '90%',
    backgroundColor: '#007BFF', // Cor primária (azul)
    borderRadius: 8,
    marginTop: 10,
    overflow: 'hidden', // Garante que o Button respeite o borderRadius
  },
});

export default LoginScreen;