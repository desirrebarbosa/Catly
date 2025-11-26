import React from 'react';
import { View as RNView, Text as RNText, Image as RNImage, TouchableOpacity as RNTouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;

const { width } = Dimensions.get('window');

export const Welcome2Screen = () => {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-primary justify-center items-center">
      <Image
        source={require('../../assets/catly-logo-white.png')}
        style={{ width: width * 0.6, height: width * 0.6 }}
        resizeMode="contain"
        className="mb-5"
      />
      <Text className="text-white text-center font-semibold text-lg leading-6 mb-20">
        Caring made{'\n'}purr-fectly simple.
      </Text>

      <TouchableOpacity 
        className="bg-white py-3 px-12 rounded-xl shadow-sm"
        onPress={() => navigation.navigate('Login')}
      >
        <Text className="text-primary font-bold text-base">Start</Text>
      </TouchableOpacity>
    </View>
  );
};