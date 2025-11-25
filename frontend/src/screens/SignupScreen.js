import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

const { width } = Dimensions.get('window');

export const SignupScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !username) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    const result = await signUp(email, password, username);
    setLoading(false);
    if (result.success) navigation.navigate('SetupProfile');
    else Alert.alert('Signup Failed', result.error);
  };

  return (
    <SafeAreaView style={globalStyles.containerPrimary} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          <View style={styles.header}>
            <Image source={require('../assets/catly-logo-white.png')} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.formContainer}>
            <Text style={globalStyles.authTitle}>Start your purr-fect journey!</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={globalStyles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={globalStyles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.gray}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <TextInput
                style={globalStyles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[globalStyles.primaryButton, styles.button, loading && globalStyles.disabledButton]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={globalStyles.primaryButtonText}>{loading ? 'Loading...' : 'Sign up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
              <Text style={globalStyles.textGray}>
                Already have an account? <Text style={globalStyles.link}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: '35%', justifyContent: 'center', alignItems: 'center' },
  logo: { width: width * 0.5, height: width * 0.5 },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  inputWrapper: { width: '100%', marginBottom: 15 },
  button: { paddingHorizontal: 40, marginTop: 5 },
  linkContainer: { marginTop: 20 },
});