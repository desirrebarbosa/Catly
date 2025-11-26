import AsyncStorage from '@react-native-async-storage/async-storage';

// CONFIGURATION:
// For Android Emulator: Use 'http://10.0.2.2:3000/api'
// For iOS Simulator: Use 'http://localhost:3000/api'
// For Physical Device: Use your computer's LAN IP, e.g., 'http://192.168.1.X:3000/api'
const BASE_URL = 'http://192.168.1.21:3000/api'; 

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
    try {
      const headers = await this._getHeaders();
      const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request Error: ${endpoint}`, error);
      throw error;
    }
  }

  get(endpoint: string) { return this.request(endpoint, { method: 'GET' }); }
  post(endpoint: string, body: any) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put(endpoint: string, body: any) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete(endpoint: string) { return this.request(endpoint, { method: 'DELETE' }); }
}

export default new ApiService();