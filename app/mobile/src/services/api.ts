import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';

const getBaseUrl = () => {
  // 1. Check for Production Environment Variable (Set in EAS or .env)
  const productionUrl = process.env.EXPO_PUBLIC_API_URL;
  if (productionUrl && !productionUrl.includes('https://catly.up.railway.app/api')) {
    return productionUrl;
  }

  // 2. If running on Web, use localhost
  if (Platform.OS === 'web') return 'http://localhost:3000/api';

  // 3. If running on physical device via Expo Go, get the PC's IP
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3000/api`;
  }

  // 4. Fallback for Android Emulator
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api';

  // 5. Fallback for iOS Simulator
  return 'http://localhost:3000/api';
};

const BASE_URL = getBaseUrl();

console.log('🔗 API Base URL:', BASE_URL);

class ApiService {
  async _getHeaders() {
    const token = await AsyncStorage.getItem('userToken');
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async request(endpoint: string, options: any = {}) {
    const fullUrl = `${BASE_URL}${endpoint}`;
    try {
      const headers = await this._getHeaders();
      const response = await fetch(fullUrl, { ...options, headers });
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`API Request Error: ${endpoint}`, error);
      
      // Only show alert if it's a network failure (not a 400/500 response handled above)
      // and we are not in a seamless background sync
      if (error.message.includes('Network request failed')) {
         Alert.alert(
             "Connection Error", 
             `Could not connect to server.\n\nTarget: ${fullUrl}\n\nPlease check your internet connection.`
         );
      }
      
      return { success: false, error: 'Network request failed' };
    }
  }

  get(endpoint: string) { return this.request(endpoint, { method: 'GET' }); }
  post(endpoint: string, body: any) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put(endpoint: string, body: any) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete(endpoint: string) { return this.request(endpoint, { method: 'DELETE' }); }
}

export default new ApiService();