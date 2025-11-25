import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }) => {
  const { logIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    const result = await logIn(email, password);
    setLoading(false);
    if (!result.success) Alert.alert('Login Failed', result.error);
  };

  return (
    <View style={globalStyles.containerPrimary}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={[globalStyles.authHeader, { paddingTop: insets.top }]}>
            <Image source={require('../assets/catly-logo-white.png')} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={globalStyles.authFormWrapper}>
            <ScrollView
              contentContainerStyle={[globalStyles.authFormContent, { paddingBottom: insets.bottom + 20 }]}
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              <Text style={globalStyles.authTitle}>Welcome back, fur-parent!</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={globalStyles.input}
                  placeholder="Username / Email"
                  placeholderTextColor={COLORS.gray}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={globalStyles.primaryButtonText}>{loading ? 'Loading...' : 'Log in'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkContainer}>
                <Text style={globalStyles.textGray}>
                  No account yet? <Text style={globalStyles.link}>Sign Up!</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: { width: width * 0.5, height: width * 0.5 },
  inputWrapper: { width: '100%', marginBottom: 20 },
  button: { paddingHorizontal: 40, marginTop: 10 },
  linkContainer: { marginTop: 20 },
});