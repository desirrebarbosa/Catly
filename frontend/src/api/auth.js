// const API_URL = 'http://10.0.2.2:3000/api'; // Android emulator
// const API_URL = 'http://localhost:3000/api'; // iOS simulator
const API_URL = 'http://192.168.1.21:3000/api'; // physical device
export const authAPI = {
  signUp: async (email, password, name) => {
    try {
      const fullUrl = `${API_URL}/auth/signup`;
      console.log('Attempting to fetch:', fullUrl); // 👈 Add this line!

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      return await response.json();
    } catch (error) {
      console.error('SignUp Error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  logIn: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('LogIn Error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  logOut: async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  updateProfile: async (token, data) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
};
