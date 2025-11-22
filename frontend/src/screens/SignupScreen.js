import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image,
  TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, 
  Platform, ScrollView, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

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
    // 👇 FIX 1: Edges prop ensures bottom is handled by the white view, not the pink container
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          
          <View style={styles.header}>
            <Image 
              source={require('../assets/catly-logo-white.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.welcomeTitle}>Start your purr-fect journey!</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.gray}
                value={username}
                onChangeText={setUsername}
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

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
              <Text style={styles.signupButtonText}>{loading ? 'Loading...' : 'Sign up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Log in</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
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
  welcomeTitle: { fontSize: 16, color: COLORS.primary, fontWeight: '500', marginBottom: 25 },
  inputWrapper: { width: '100%', marginBottom: 15 },
  input: {
    borderWidth: 1, borderColor: '#EEEEEE', backgroundColor: '#F9F9F9',
    borderRadius: 10, paddingHorizontal: 15, paddingVertical: 15, fontSize: 14,
    marginBottom: 15, color: COLORS.black,
  },
  signupButton: {
    backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 40,
    borderRadius: 10, marginTop: 5, elevation: 2,
  },
  signupButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  loginLinkContainer: { marginTop: 20 },
  loginText: { color: COLORS.gray, fontSize: 13 },
  loginLink: { color: COLORS.primary, fontWeight: 'bold', textDecorationLine: 'underline' },
});