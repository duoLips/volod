import API from './axios';

export async function refreshSession() {
    try {
        // Refresh session on backend
        await API.post('/auth/session/refresh');

        // Then fetch updated session info
        const sessionRes = await API.get('/auth/session');
        return sessionRes.data.user;
    } catch (err) {
        console.error('Session refresh failed:', err);
        return null;
    }
}
