import React, { useState } from 'react';
import { View as RNView, Text as RNText, TextInput as RNTextInput, TouchableOpacity as RNTouchableOpacity, Alert, Image as RNImage } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const TouchableOpacity = RNTouchableOpacity as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const Image = RNImage as any;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await api.post('/auth/password-reset', { email });
    setLoading(false);
    Alert.alert('Check Email', 'Reset instructions sent.', [{ text: 'Back to Login', onPress: () => navigation.goBack() }]);
  };

  return (
    <View className="flex-1 bg-primary">
       <View style={{ paddingTop: insets.top, paddingBottom: 16 }} className="px-6 flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-2xl backdrop-blur-md">
             <ChevronLeftIcon color="white" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
       </View>

      <View className="h-[25%] justify-center items-center">
        <Image source={require('../../assets/catly-logo-white.png')} className="w-40 h-40" resizeMode="contain" />
        <Text className="text-white text-2xl font-bold">Recovery</Text>
      </View>

      <View className="flex-1 bg-white rounded-t-[30px] p-8 items-center shadow-lg">
        <Text className="text-xl font-bold text-secondary mb-2">Forgot Password?</Text>
        <Text className="text-gray-500 text-center mb-8 px-4 leading-5">Don't worry! Enter your email address below and we will send you a link to reset it.</Text>
        
        <View className="w-full mb-6">
          <Text className="font-bold text-gray-400 text-xs uppercase mb-2 ml-1">Email Address</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-2xl h-14 px-4 text-base text-secondary"
            placeholder="name@example.com" 
            placeholderTextColor="#D1D5DB"
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View className="w-full mt-2">
          <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />
        </View>
      </View>
    </View>
  );
};
