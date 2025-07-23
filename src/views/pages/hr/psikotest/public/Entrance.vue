<script setup >
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

import {axiosHr} from '@/service/axios';
import AppFooter from '@/layout/AppFooter.vue';

const router = useRouter();
const toast = useToast();
const sign = ref({});
const submitted = ref(false);
const result = ref({});

const publicAccount = ref({
    public_token: localStorage.getItem('public_token'),
});

const auth = async () =>{
    const response = await axiosHr.get('/psikotest/public/entrance/'+publicAccount.value.public_token);
    if(response.data.status == 200){
        router.push({ path: '/public/rooms' });
        console.clear();
    }else{
        localStorage.removeItem('public_token');
        localStorage.removeItem('candidate_code');
    } 
}
onMounted( () => {
    auth();
});

const signIn = async () =>{
    submitted.value = true;
    if(sign.value.birth){
        sign.value.birth = formatDate(sign.value.birth);
    }
    
    if (sign?.value.email?.trim()) {
        const data = sign.value;
        const saving = await axiosHr.post('/psikotest/public/entrance', data);
        if(saving.data.status == 200){
            localStorage.setItem('public_token', saving.data.public_token); // save public_token
            localStorage.setItem('candidate_code', saving.data.candidate_code); // save candidate_code
            router.push({ path: '/public/rooms' });
            console.clear();
        }else{
            result.value.message = saving.data.message;
            result.value.severity = 'error';
        }
    }
}

// formating
const formatDate = (date) => {
    if(date === null){
        return null;
    }

    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

</script>

<template>
    <Toast/>
    <div class="bg-surface-0 dark:bg-surface-900">
        <div id="home" class="landing-wrapper overflow-hidden">
            <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
                <div class="flex flex-col items-center justify-center">
                    <div style="border-radius: 56px; padding: 0.3rem;">
                        <div 
                            class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center" 
                            style="border-radius: 53px; background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #efe1af 0%, #c3dcfa 100%)"
                        >
                            <div class="gap-4 flex flex-col items-center">
                                <h1 class="text-surface-900 dark:text-surface-0 font-bold text-2xl lg:text-4xl">Welcome to Tri Wahana Universal</h1>
                                <span class="text-muted-color mb-5">Please sign in to continue.</span>
                                <div class="w-full">
                                    <div class="flex items-center gap-2 mb-4">
                                        <label for="email" class="font-semibold w-24 p-fluid">Email :</label>
                                        <InputText id="email" v-model.trim="sign.email" required="true" autofocus :invalid="submitted && !sign.email" fluid />
                                    </div>
                                    <div class="flex items-center gap-2 mb-4">
                                        <label for="birth" class="font-semibold w-24">Birthday :</label>
                                        <InputText id="birth" v-model.trim="sign.birth" required="true" autofocus :invalid="submitted && !sign.birth" fluid placeholder='Please enter with "yyyy-mm-dd" format' />
                                    </div>
                                </div>
                                <div class="col-span-12 mt-5 text-center">
                                    <Button label="Continue" severity="success" @click="signIn"  />
                                    <Message :severity="result?.severity" variant="simple">{{ result?.message }}</Message>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AppFooter />
        </div>
    </div>
</template>
