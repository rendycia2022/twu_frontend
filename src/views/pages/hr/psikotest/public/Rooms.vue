<script setup >
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import disc_instruction from '@/components/hr/psikotest/public/disc_instruction.vue';

import {axiosHr} from '@/service/axios';
import AppFooter from '@/layout/AppFooter.vue';

import DiscProcess from '@/components/hr/psikotest/public/DiscProcess.vue';

const router = useRouter();
const publicAccount = ref({
    public_token: localStorage.getItem('public_token'),
    candidate_code: localStorage.getItem('candidate_code'),
});

const auth = async () =>{
    const response = await axiosHr.get('/psikotest/public/entrance/'+publicAccount.value.public_token);
    if(response.data.status != 200){
        localStorage.removeItem('public_token');
        localStorage.removeItem('candidate_code');
        router.push({ path: '/public/login' });
    }
}
onMounted( () => {
    auth();
    candidate();
    submitAuth();
});

// get candidate info
const info = ref({});
const candidate = async () =>{
    const response = await axiosHr.get('/psikotest/public/rooms/'+publicAccount.value.candidate_code);
    if(response.data.status == 200){
        info.value.name = 'Hallo, '+response.data.message.name;
        info.value.birthday = 'Tanggal Lahir: '+response.data.message.birth;
        info.value.gender = 'Gender: '+response.data.message.gender;
    }
}

// psikotest prosess
const submitProcess = ref({});

const submitDisc = () =>{
    localStorage.setItem('submit_disc', true);

    submitAuth();
}

const submitAuth = () =>{
    if(localStorage.getItem('submit_disc')){
        const disc = {
            button: true,
            test: true,
        }
        submitProcess.value.disc = disc;
    }
}


</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-900">
        <div 
            style="border-radius: 20px; background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #efe1af 0%, #c3dcfa 100%)"
        >
            <div class="grid grid-cols-12 gap-4 justify-center">
                <div
                    class="col-span-12 mt-20 mb-20 p-2 md:p-20"
                    
                >
                <div class="card">
                    <div class="font-semibold text-xl">{{ info.name }}</div>
                    <div class="text-sm">{{ info.birthday }}</div>
                    <div class="text-sm mb-3">{{ info.gender }}</div>
                    <Tabs value="DISC">
                        <TabList>
                            <Tab value="DISC">DISC</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel value="DISC">
                                <disc_instruction />
                                <div class="col-span-12 mt-5 text-center">
                                    <Button v-if="!submitProcess.disc?.button" label="Continue" severity="info" @click="submitDisc"  />
                                </div>

                                <DiscProcess v-if="submitProcess.disc?.test" />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </div>
                </div>
            </div>
            <AppFooter />
        </div>
        
    </div>
</template>
