import React from 'react';
import { Image } from 'react-native';

export const CatLogo = ({ size = 150, color = 'pink' }) => {
  const logoSource = color === 'white' 
    ? require('../assets/catly-logo-white.png')
    : require('../assets/catly-logo-pink.png');

  return (
    <Image
      source={logoSource}
      style={{ 
        width: size, 
        height: size, // Keep it square to let resizeMode handle the aspect ratio
      }}
      resizeMode="contain"
    />
  );
};