import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const Welcome2Screen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/catly-logo-white.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Caring made{'\n'}purr-fectly simple.</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Make sure this is your Pink color
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});