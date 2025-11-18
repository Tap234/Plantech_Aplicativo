import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  Alert, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  ActivityIndicator,
  Image as RNImage,
} from 'react-native';
import { router } from 'expo-router';
import api from '../api';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha o email e a senha.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password,
      });

      if (response.data && response.data.token) {
        if (Platform.OS === 'web') {
          localStorage.setItem('userToken', response.data.token);
        } else {
          await SecureStore.setItemAsync('userToken', response.data.token);
        }

        router.replace('/(tabs)');
      } else {
        Alert.alert('Erro', 'Ocorreu um problema inesperado.');
      }

    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.response?.status === 401) {
        Alert.alert('Acesso Negado', 'Email ou senha incorretos.');
      } else {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <RNImage
          source={require('../assets/images/PlanTech.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessible
          accessibilityLabel="PlanTech logo"
        />
      </View>

      <View style={styles.formContainer}>
        
        {}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9AA7A0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9AA7A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <TouchableOpacity>
            <Text style={styles.signupText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7EA',
  },
  headerContainer: {
    flex: 0.35,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logo: {
    marginBottom: 6,
  },
  logoImage: {
    display: 'flex',
    alignSelf: 'center',
    width: 180,
    height: 180,
    marginBottom: 16,
    objectFit: 'contain',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D6A4F',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 14,
    color: '#748c94',
    textAlign: 'center',
  },
  formContainer: {
    flex: 0.65,
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 20,
    height: 60,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDF3EF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#0F4F36',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#FF7A3D',
    height: 60,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#0F4F36',
    fontSize: 15,
  },
  signupText: {
    color: '#0F4F36',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default LoginScreen;