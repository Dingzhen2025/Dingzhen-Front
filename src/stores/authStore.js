//认证状态
import { defineStore } from 'pinia';
import { login, register, changeUsername } from '../api/auth';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        userInfo: null
    }),
    actions: {
        async login(account, password) {
            const res = await login(account, password);
            this.token = res.token;
            this.userInfo = {
                id: res.id,
                name: res.name,
                email: res.email,
                createdAt: res.createdAt
            };
            localStorage.setItem('token', res.token);
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
            return res;
        },
        async registerUser(user) {
            return await register(user);
        },
        async changeName(userId, name) {
            await changeUsername(userId, name);
            if (this.userInfo) this.userInfo.name = name;
        },
        logout() {
            this.token = '';
            this.userInfo = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
        }
    }
});