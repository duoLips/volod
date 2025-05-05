import API from './axios';

export function searchQuery(q) {
    return API.get(`/search?q=${encodeURIComponent(q)}`);
}
