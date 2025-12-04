import React, { useEffect } from 'react';
import { View as RNView, Image as RNImage, Dimensions } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';

// Fix: Declare require to avoid TypeScript errors when node types are missing
declare var require: any;

// Cast for NativeWind
const View = RNView as any;
const Image = RNImage as any;
const useNavigation = (ReactNavigation as any).useNavigation;

const { width } = Dimensions.get('window');

export const WelcomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome2');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Image
        source={require('../../assets/catly-logo-pink.png')}
        style={{ width: width * 0.6, height: width * 0.6 }}
        resizeMode="contain"
      />
    </View>
  );
};