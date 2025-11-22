import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  style 
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'white':
        return styles.whiteBtn;
      case 'dark':
        return styles.darkBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'white':
        return styles.whiteText;
      case 'dark':
        return styles.darkText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button, 
        getButtonStyle(), 
        disabled && styles.disabledBtn, 
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'white' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[styles.buttonText, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25, // Pill shape
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    // Shadows for that "pop" effect
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
  },
  whiteBtn: {
    backgroundColor: COLORS.white,
  },
  darkBtn: {
    backgroundColor: COLORS.black, // Matches the "Setup Profile" dark button
  },
  disabledBtn: {
    opacity: 0.6,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: COLORS.white,
  },
  whiteText: {
    color: COLORS.primary,
  },
  darkText: {
    color: COLORS.white,
  },
});