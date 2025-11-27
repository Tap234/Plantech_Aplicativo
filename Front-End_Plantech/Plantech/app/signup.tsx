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

const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Preencha nome, email e senha.');
      return;
    }

    setIsLoading(true);

    try {
      // endpoint de registro (ajuste conforme backend)
      await api.post('/auth/register', {
        nome: name,
        email,
        password,
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login.');
      router.replace('/login');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      if (error.response?.data?.message) {
        Alert.alert('Erro', error.response.data.message);
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#9AA7A0"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputWrapper}>
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
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9AA7A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.loginText}>Log in</Text>
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
  logoImage: {
    display: 'flex',
    alignSelf: 'center',
    width: 180,
    height: 180,
    marginBottom: 16,
    objectFit: 'contain',
  },
  formContainer: {
    flex: 0.65,
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 20,
    height: 60,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDF3EF',
    justifyContent: 'center',
  },
  input: {
    color: '#333',
    fontSize: 16,
  },
  signupButton: {
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
  signupButtonText: {
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
  loginText: {
    color: '#0F4F36',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SignupScreen;
