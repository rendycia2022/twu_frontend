<script setup >
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import disc_instruction from '@/components/hr/psikotest/public/disc_instruction.vue';

import {axiosHr} from '@/service/axios';
import AppFooter from '@/layout/AppFooter.vue';

import DiscProcess from '@/components/hr/psikotest/public/DiscProcess.vue';

const router = useRouter();

</script>

<template>
    <h1>Result DISC</h1>
</template>
