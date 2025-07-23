import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'error',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/twu',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },

                // finance & accounting
                {
                    path: '/accounting/coa',
                    name: 'coa',
                    component: () => import('@/views/pages/accounting/Coa.vue')
                },

                // hr
                {
                    path: '/hr/candidates',
                    name: 'candidates',
                    component: () => import('@/views/pages/hr/Candidates.vue')
                },
                {
                    path: '/hr/psikotest/disc',
                    name: 'psikotest_disc',
                    component: () => import('@/views/pages/hr/psikotest/Disc.vue')
                },

                // manages
                {
                    path: '/manages/users',
                    name: 'manages_users',
                    component: () => import('@/views/pages/manages/Users.vue')
                },
                {
                    path: '/manages/account',
                    name: 'manages_personal',
                    component: () => import('@/views/pages/manages/Account.vue')
                },
            ]
        },
        {
            path: '/public/signup',
            name: 'public_signup',
            component: () => import('@/views/pages/hr/public/Signup.vue')
        },
        {
            path: '/public/signup/:code',
            name: 'public_signupByCode',
            component: () => import('@/views/pages/hr/public/Signup.vue')
        },
        {
            path: '/public/login',
            name: 'psikotest_public_entrance',
            component: () => import('@/views/pages/hr/psikotest/public/Entrance.vue')
        },
        {
            path: '/public/rooms',
            name: 'psikotest_public_rooms',
            component: () => import('@/views/pages/hr/psikotest/public/Rooms.vue')
        },
    ]
});

export default router;
