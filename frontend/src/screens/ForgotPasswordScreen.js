
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../api/auth';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.requestPasswordReset(email);
      
      if (response.success) {
        Alert.alert(
          'Check your email',
          'We have sent password reset instructions to your email.',
          [{ text: 'Back to Login', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to send reset link.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.containerPrimary} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerIcon}>🔒</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={globalStyles.authTitle}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Don't worry! It happens. Please enter the address associated with your account.
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={globalStyles.label}>Email Address</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                globalStyles.primaryButton, 
                styles.button, 
                loading && globalStyles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={globalStyles.primaryButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { 
    height: '30%', 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerIcon: {
    fontSize: 60,
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  inputWrapper: { 
    width: '100%', 
    marginBottom: 25 
  },
  button: { 
    width: '100%',
    marginTop: 10 
  },
});

export default ForgotPasswordScreen;
