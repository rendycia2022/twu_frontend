<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    {
        label: 'Finance & Accounting',
        icon: 'pi pi-fw pi-credit-card',
        to: '/finance_accounting',
        items: [
            {
                label: 'Chart of Accounts (COA)',
                icon: 'pi pi-fw pi-credit-card',
                to: '/accounting/coa'
            },
        ]
    },
    {
        label: 'HR',
        icon: 'pi pi-fw pi-briefcase',
        to: '/hr',
        items: [
            {
                label: 'Psikotest',
                icon: 'pi pi-fw pi-th-large',
                items: [
                    {
                        label: 'DISC',
                        icon: 'pi pi-fw pi-chart-line',
                        to: '/hr/psikotest/disc'
                    },
                ]
            },
            {
                label: 'Candidates',
                icon: 'pi pi-fw pi-users',
                to: '/hr/candidates'
            },
        ]
    },
    {
        label: 'Manages',
        items: [
            { label: 'Users', icon: 'pi pi-fw pi-user-edit', to: '/manages/users',},
        ]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
