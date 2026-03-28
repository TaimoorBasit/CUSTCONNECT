import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'cc_token';
const USER_KEY = 'cc_user';

export const storage = {
    saveToken: async (token) => {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        } catch (e) {
            console.error('Error saving token', e);
        }
    },
    getToken: async () => {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (e) {
            return null;
        }
    },
    saveUser: async (user) => {
        try {
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        } catch (e) {
            console.error('Error saving user', e);
        }
    },
    getUser: async () => {
        try {
            const user = await SecureStore.getItemAsync(USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },
    clear: async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
        } catch (e) { }
    }
};
