import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image,
  TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, 
  Platform, ScrollView, Dimensions, StatusBar 
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }) => {
  const { logIn } = useAuth();
  const insets = useSafeAreaInsets(); // 👇 Get safe area dimensions
  
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* Pink Header Area */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <Image 
              source={require('../assets/catly-logo-white.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* White Bottom Section */}
          <View style={styles.formWrapper}>
            <ScrollView 
              contentContainerStyle={[
                styles.scrollContent, 
                // 👇 Add padding to content ONLY, keeping background white at bottom
                { paddingBottom: insets.bottom + 20 } 
              ]} 
              bounces={false} 
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.welcomeTitle}>Welcome back, fur-parent!</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Username / Email"
                  placeholderTextColor={COLORS.gray}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                <Text style={styles.loginButtonText}>{loading ? 'Loading...' : 'Log in'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupLinkContainer}>
                <Text style={styles.signupText}>No account yet? <Text style={styles.signupLink}>Sign Up!</Text></Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Background behind everything (Pink)
  },
  header: {
    height: '40%', // Takes up top 40% of screen
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  formWrapper: {
    flex: 1, // Takes up remaining space (60%)
    backgroundColor: COLORS.white, // This ensures white touches the bottom edge
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden', // Ensures content clips to rounded corners
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 16,
    color: COLORS.primary, 
    fontWeight: '500',
    marginBottom: 30,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 14,
    marginBottom: 15,
    color: COLORS.black,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
    elevation: 2,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupLinkContainer: {
    marginTop: 20,
  },
  signupText: {
    color: COLORS.gray,
    fontSize: 13,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});