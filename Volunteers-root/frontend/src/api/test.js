import API from './axios.js';

export function testConnection() {
    return API.get('/test');
}
