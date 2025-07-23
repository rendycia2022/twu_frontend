<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { useRouter } from 'vue-router';
import { useConfirm } from "primevue/useconfirm"

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
import { onMounted, ref } from 'vue';


const router = useRouter();

// pinia service
const auth = async () =>{
    await authStore.authentication();
    if(!localStorage.getItem('token')){
        router.push({ path: '/login' });
    }
}

onMounted( () => {
    auth();
});

// logout
const confirm = useConfirm();
const requireConfirmation = (event) => {
    confirm.require({
        target: event.currentTarget,
        group: 'headless',
        message: 'Please, confirm to sign out!',
        accept: () => {
            localStorage.removeItem('token');
            router.push({ path: '/login' });
        },
    });
}

</script>

<template>
    <ConfirmPopup group="headless">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="rounded p-4">
                <span>{{ message.message }}</span>
                <div class="flex items-end gap-2 mt-4">
                    <Button label="Yes, confirm" severity="danger" @click="acceptCallback" size="small"></Button>
                </div>
            </div>
        </template>
    </ConfirmPopup>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/dashboard" class="layout-topbar-logo">
                <span>Halo, {{ authStore.getUser?.name || '' }}!</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <Button type="button" severity="contrast" variant="text" class="layout-topbar-action" @click="requireConfirmation($event)" >
                    <i class="pi pi-sign-out"></i>
                </Button>
            </div>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <router-link to="/manages/account" >
                        <button type="button" class="layout-topbar-action" >
                            <i class="pi pi-user"></i>
                            <span>Profile</span>
                        </button>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
