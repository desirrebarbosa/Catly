import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.21:3000/api'; 

class ApiService {
  
  // Helper to get headers with the token
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

  // Generic Request Handler
  async _request(endpoint, options = {}) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        // Throw a clean error message from the backend
        throw new Error(data.error || data.message || 'Something went wrong');
      }
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  // --- Public Methods ---

  async get(endpoint) {
    const headers = await this._getHeaders();
    return this._request(endpoint, { method: 'GET', headers });
  }

  async post(endpoint, body) {
    const headers = await this._getHeaders();
    return this._request(endpoint, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(body) 
    });
  }

  async put(endpoint, body) {
    const headers = await this._getHeaders();
    return this._request(endpoint, { 
      method: 'PUT', 
      headers, 
      body: JSON.stringify(body) 
    });
  }

  async delete(endpoint) {
    const headers = await this._getHeaders();
    return this._request(endpoint, { method: 'DELETE', headers });
  }
}

export default new ApiService();