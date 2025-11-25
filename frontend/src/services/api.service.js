
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANT: REPLACE THIS WITH YOUR COMPUTER'S CURRENT LAN IP ADDRESS
// If you are on an Android Emulator, you can use '10.0.2.2'
// If you are on an iOS Simulator, you can use 'localhost'
// If you are on a PHYSICAL DEVICE, use your computer's IP (e.g., 192.168.1.x)
const IP_ADDRESS = '192.168.1.21'; 
const PORT = '3000';
const BASE_URL = `http://${IP_ADDRESS}:${PORT}/api`;

class ApiService {
  async _getHeaders(isMultipart = false) {
    const token = await AsyncStorage.getItem('userToken');
    const headers = {
      'Accept': 'application/json',
      'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async _request(endpoint, options = {}) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      console.log(`Requesting: ${url}`); // Debug log to help check IP

      // Add a timeout to prevent hanging forever
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

      const response = await fetch(url, { 
        ...options, 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (!response.ok) {
        // If 401, the token is bad. We should ideally trigger a logout here.
        if (response.status === 401) {
          console.warn('Token expired or invalid');
        }
        throw new Error(data.error || data.message || 'Something went wrong');
      }
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  async get(endpoint) {
    const headers = await this._getHeaders();
    return this._request(endpoint, { method: 'GET', headers });
  }

  async post(endpoint, body) {
    const headers = await this._getHeaders();
    return this._request(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
  }

  async put(endpoint, body) {
    const headers = await this._getHeaders();
    return this._request(endpoint, { method: 'PUT', headers, body: JSON.stringify(body) });
  }

  async delete(endpoint) {
    const headers = await this._getHeaders();
    return this._request(endpoint, { method: 'DELETE', headers });
  }
}

export default new ApiService();
