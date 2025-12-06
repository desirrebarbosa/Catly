
import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, TouchableOpacity as RNTouchableOpacity, Image as RNImage, Alert, KeyboardAvoidingView as RNKeyboardAvoidingView, Platform, Modal } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { ShieldCheckIcon } from 'react-native-heroicons/solid';

declare var require: any;

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const KeyboardAvoidingView = RNKeyboardAvoidingView as any;
const useNavigation = (ReactNavigation as any).useNavigation;

export const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, login2FA, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2FA State
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [tempToken, setTempToken] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    
    if (result.success) {
        if (result.requires2FA) {
            setTempToken(result.data.tempToken);
            setShow2FA(true);
        }
        // If success and no 2FA, AuthContext auto updates and Nav handles it
    } else {
        Alert.alert('Login Failed', result.error);
    }
  };

  const handleVerify2FA = async () => {
      if(twoFACode.length !== 6) return Alert.alert("Invalid Code", "Must be 6 digits");
      setLoading(true);
      const res = await login2FA(tempToken, twoFACode);
      setLoading(false);
      if(!res.success) {
          Alert.alert("Failed", res.error);
      }
      // If success, Context updates
  };

  // const handleGoogleLogin = async () => {

  //     Alert.alert(
  //         'Google Sign-In', 
  //         'In a full build, this opens the Google Auth sheet. We will simulate sending a test token to the backend.',
  //         [
  //             { text: 'Cancel', style: 'cancel' },
  //             { 
  //                 text: 'Simulate Success', 
  //                 onPress: async () => {
  //                     setLoading(true);
  //                     const res = await googleLogin("mock_google_id_token_12345");
  //                     setLoading(false);
  //                     if(!res.success) Alert.alert("Error", res.error);
  //                 }
  //             }
  //         ]
  //     );
  // };

  return (
    <View className="flex-1 bg-primary">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="h-[35%] justify-center items-center">
          <Image source={require('../../assets/catly-logo-white.png')} className="w-40 h-40" resizeMode="contain" />
        </View>

        <View className="flex-1 bg-white rounded-t-[30px] px-8 pt-10 items-center">
          <Text className="text-primary font-medium text-lg mb-8">Welcome back, fur-parent!</Text>

          <View className="w-full mb-5">
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-base text-secondary mb-4"
              placeholder="Email"
              placeholderTextColor="#9FA5C0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-base text-secondary"
              placeholder="Password"
              placeholderTextColor="#9FA5C0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="w-full px-5 mt-2">
            <Button title="Log in" onPress={handleLogin} loading={loading} />
            
            {/* <TouchableOpacity 
                // onPress={handleGoogleLogin}
                className="flex-row items-center justify-center bg-white border border-gray-200 h-14 rounded-2xl mt-4 shadow-sm"
            >
                <Text className="text-gray-600 font-bold text-lg mr-2">G</Text>
                <Text className="text-secondary font-bold text-base">Continue with Google</Text>
            </TouchableOpacity> */}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-5">
            <Text className="text-gray-400">
              No account yet? <Text className="text-primary font-bold underline">Sign Up!</Text>
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="mt-3">
             <Text className="text-gray-400 text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 2FA Modal */}
      <Modal visible={show2FA} transparent animationType="fade">
          <View className="flex-1 bg-black/60 justify-center items-center px-6">
              <View className="bg-white w-full rounded-3xl p-6 items-center">
                  <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                      <ShieldCheckIcon size={32} color="#3B82F6" />
                  </View>
                  <Text className="text-xl font-bold text-secondary mb-2">Two-Factor Auth</Text>
                  <Text className="text-gray-500 text-center mb-6">Enter the 6-digit code from your authenticator app.</Text>
                  
                  <TextInput 
                      className="bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl tracking-widest font-bold h-16 w-full mb-6 text-secondary"
                      placeholder="000000"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={twoFACode}
                      onChangeText={setTwoFACode}
                      autoFocus
                  />
                  
                  <View className="w-full gap-3">
                      <Button title="Verify" onPress={handleVerify2FA} loading={loading} />
                      <Button title="Cancel" variant="secondary" onPress={() => setShow2FA(false)} />
                  </View>
              </View>
          </View>
      </Modal>
    </View>
  );
};
