import React, { useEffect } from 'react';
import { View, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../constants/globalStyles';

const { width } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Welcome2');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.center}>
        <Image
          source={require('../assets/catly-logo-pink.png')}
          style={{ width: width * 0.6, height: width * 0.6 }}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};