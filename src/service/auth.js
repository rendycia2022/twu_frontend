import { defineStore } from 'pinia';
import {axiosSign} from '@/service/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || ''
  }),

  actions: {
    async authentication() {
        const token = localStorage.getItem('token');
        if(token != ''){
            try {
                const response = await axiosSign.get('/auth/access/'+token);
    
                if (response.data.status != 200) {
                    console.error('Access failed.');
                    localStorage.removeItem('token');
                } 
    
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('user_code', this.user.code); // save code user

            } catch (error) {
                console.error('Access error:', error);
                throw error;
            }
        }
    },
  },

  getters: {
    getUser: (state) => state.user,
  }
});