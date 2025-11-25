const axios = require('axios');

class TestClient {
  constructor(baseUrl) {
    this.api = axios.create({ baseURL: baseUrl });
    this.token = null;
    this.store = {}; // To share data between steps (like user IDs, cat IDs)
  }

  setToken(token) {
    this.token = token;
    console.log('🔑 \x1b[33m[State]\x1b[0m Auth Token Set');
  }

  getHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // --- Generic Request Wrappers ---
  
  async post(endpoint, data, stepName) {
    return this._execute('POST', endpoint, data, stepName);
  }

  async get(endpoint, stepName) {
    return this._execute('GET', endpoint, null, stepName);
  }

  async put(endpoint, data, stepName) {
    return this._execute('PUT', endpoint, data, stepName);
  }

  async delete(endpoint, stepName) {
    return this._execute('DELETE', endpoint, null, stepName);
  }

  // --- Execution Logic ---

  async _execute(method, endpoint, data, stepName) {
    process.stdout.write(`⏳ ${stepName}... `);
    try {
      const res = await this.api({
        method,
        url: endpoint,
        data,
        headers: this.getHeaders()
      });
      
      console.log('\x1b[32mPASSED\x1b[0m'); // Green "PASSED"
      return res.data;
    } catch (error) {
      console.log('\x1b[31mFAILED\x1b[0m'); // Red "FAILED"
      this._logError(error);
      throw error; // Stop the test
    }
  }

  _logError(error) {
    if (error.response) {
      console.error(`   \x1b[31m[${error.response.status}]\x1b[0m ${error.response.data.error || error.response.statusText}`);
      if (error.response.data.details) {
        console.error('   Details:', JSON.stringify(error.response.data.details, null, 2));
      }
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }

  // --- Assertion Helper ---
  assert(condition, message) {
    if (!condition) {
      console.log('\x1b[31mASSERTION FAILED\x1b[0m');
      console.error(`   Expected: ${message}`);
      throw new Error(`Assertion Failed: ${message}`);
    }
  }
}

module.exports = TestClient;