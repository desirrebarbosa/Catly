import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, Text as RNText, ActivityIndicator, View } from 'react-native';

const TouchableOpacity = RNTouchableOpacity as any;
const Text = RNText as any;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  className?: string;
}

export const Button = ({ title, onPress, variant = 'primary', loading, className }: ButtonProps) => {
  const baseStyle = "h-14 rounded-2xl items-center justify-center shadow-sm active:scale-95 transition-transform";
  
  const variants = {
    primary: "bg-primary",
    secondary: "bg-white border border-gray-100",
    outline: "bg-transparent border-2 border-primary",
    danger: "bg-red-500",
  };

  const textVariants = {
    primary: "text-white font-bold text-lg",
    secondary: "text-secondary font-bold text-lg",
    outline: "text-primary font-bold text-lg",
    danger: "text-white font-bold text-lg",
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? 'white' : '#F5A9C8'} />
      ) : (
        <Text className={textVariants[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};