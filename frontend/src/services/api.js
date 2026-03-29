import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

const ACCESS_TOKEN_KEY = 'vpn_access_token';
const USER_KEY = 'vpn_user';

let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || '';
let refreshPromise = null;

export function setAccessToken(token) {
    accessToken = token || '';

    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
}

export function persistUser(user) {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
}

export function getPersistedUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
        return null;
    }
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh')
            .then((response) => {
                const token = response.data?.access_token || '';
                setAccessToken(token);
                return token;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const token = await refreshAccessToken();
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                setAccessToken('');
                persistUser(null);
                throw refreshError;
            }
        }

        throw error;
    }
);

export async function loginByTelegram(initData) {
    const response = await api.post('/auth/login_by_tg', { init_data: initData });
    setAccessToken(response.data.access_token);
    return response.data;
}

export async function refreshSession() {
    const response = await api.post('/auth/refresh');
    setAccessToken(response.data.access_token);
    return response.data;
}

export async function fetchMe() {
    const response = await api.get('/users/me');
    persistUser(response.data);
    return response.data;
}

export async function fetchUserSubscriptions(userId) {
    const response = await api.get(`/users/${userId}/subscriptions`);
    return response.data;
}

export async function fetchSubscription(subscriptionId) {
    const response = await api.get(`/subscription/${subscriptionId}`);
    return response.data;
}

export async function fetchSubscriptionConfig(subscriptionId) {
    const response = await api.get(`/subscription/${subscriptionId}/config`);
    return response.data;
}

export async function getSubscriptionPrice(payload) {
    const response = await api.post('/subscription/get_price', payload);
    return response.data;
}

export async function createSubscription(payload) {
    const response = await api.post('/subscription/', payload);
    return response.data;
}

export async function renewSubscription(subscriptionId, payload) {
    const response = await api.post(`/subscription/${subscriptionId}/renew`, payload);
    return response.data;
}

export async function cancelSubscription(subscriptionId) {
    const response = await api.post(`/subscription/${subscriptionId}/cancel`);
    return response.data;
}
