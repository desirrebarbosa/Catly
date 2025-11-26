import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, Text as RNText, ActivityIndicator } from 'react-native';

// Cast components to allow 'className' prop for NativeWind
const TouchableOpacity = RNTouchableOpacity as any;
const Text = RNText as any;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  className?: string;
}

export const Button = ({ title, onPress, variant = 'primary', loading, className }: ButtonProps) => {
  const baseStyle = "h-14 rounded-2xl items-center justify-center shadow-sm active:opacity-80";
  
  const variants = {
    primary: "bg-primary",
    secondary: "bg-white border border-gray-200",
    outline: "bg-transparent border border-primary",
  };

  const textVariants = {
    primary: "text-white font-bold text-lg",
    secondary: "text-secondary font-semibold text-lg",
    outline: "text-primary font-semibold text-lg",
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#F5A9C8'} />
      ) : (
        <Text className={textVariants[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};