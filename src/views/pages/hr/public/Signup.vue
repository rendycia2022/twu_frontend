<script setup >
import { onMounted, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';

import {axiosHr} from '@/service/axios';
import AppFooter from '@/layout/AppFooter.vue';

// component
import Personal from './signup/Personal.vue';
import Social from './signup/Social.vue';
import Education from './signup/Education.vue';
import Experience from './signup/Experience.vue';

const toast = useToast();

const account = ref({
    token: localStorage.getItem('token'),
    user_code: localStorage.getItem('user_code'),
});

const uploadLink = ref(
    axiosHr.defaults.baseURL+'/upload'
);

const submitted = ref(false);
const product = ref({
    profile:{}
});

const saveProduct = async () =>{
    submitted.value = true;

    product.value.ktp = product.value.profile.personal.ktp;
    product.value.email = product.value.profile.personal.email;
    product.value.name = product.value.profile.personal.name;
    const data = product.value;

    const saving = await axiosHr.post('/candidates', data);
    result(saving);
}

const messages = ref();
const result = (saving) =>{
    if(saving.status == 200){
        if(saving.data.status == 200){
            toast.add({ severity: 'success', summary: "Ok.", detail: "Sending succeed.", life: 4000 });
            fileupload.value.upload();
            messages.value = "Thank you for applying to us.";
        }else{
            toast.add({ severity: 'warn', summary: saving.data.title, detail:saving.data.message, life: 5000 });
        }
    }else{
        toast.add({ severity: 'warn', summary: saving.status, detail: saving.statusText, life: 4000 });
    }
}

const getPersonal = async (data) =>{
    product.value.profile.personal = data;
}

const getSocial = async (data) =>{
    product.value.profile.social = data
}

const getEducation = async (data) =>{
    product.value.profile.education = data
}

const getExperience = async (data) =>{
    product.value.profile.experience = data
}

// auto save handling
const initializeData = async (code) =>{
    
    const response = await axiosHr.get(`/candidates/${code}`, {
        params:{
            token: account.value.token,
        }
    });
    product.value.profile = response.data.profile;
}

onMounted(() => {

    const code = (new URL(window.location.href)).pathname.split('/')[3];
    if (code) {
        initializeData(code);
    }

    const saved = localStorage.getItem('profile')
    if (saved) {
        let data = JSON.parse(saved)
        product.value = data;
    }
});

watch(product, (newVal) => {
    localStorage.setItem('profile', JSON.stringify(newVal))
}, { deep: true });


// upload
const fileupload = ref();
// Sebelum upload, tambahkan parameter ke fileUploader
const onBeforeUpload = (event) => {

    // Tambahkan parameter ke setiap file yang akan diupload
    event.formData.append("email", product.value.email);
    event.formData.append("name", product.value.name);

};

</script>

<template>
    <Toast/>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen">
        <Card style="width: 100rem; overflow: hidden" >
            <template #header>
                <div class="relative mx-auto">
                    <img alt="bg_signup" src="@/assets/images/bg_signup.jpg" class="w-full rounded" />
                    <div class="absolute" style="left:20px; bottom: 10px;">
                        <img src="@/assets/images/logo-2.png" alt="logo-2" class="w-full rounded" style="max-width: 100%" />
                        <!-- <div style="border-radius: 5px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                            <div class="p-2 dark:bg-surface-800 h-full" style="border-radius: 8px">
                                <span class="text-xl text-surface-100 dark:text-surface-200">Perusahaan penyulingan minyak milik swasta pertama di Indonesia.</span>
                            </div>
                        </div> -->
                    </div>
                </div>
                
            </template>
            <template #title></template>
            <template #subtitle></template>
            <template #content>
                <Fieldset legend="Data Pribadi">
                    <Personal @payload="getPersonal" :submit="submitted" :initial="product.profile.personal" />
                    <Social @payload="getSocial" :initial="product.profile.social" />
                </Fieldset>
                <Fieldset legend="Riwayat Pendidikan">
                    <Education @payload="getEducation" :initial="product.profile.education" />
                </Fieldset>
                <Fieldset legend="Pengalaman Kerja">
                    <Experience @payload="getExperience" :initial="product.profile.experience" />
                </Fieldset>
                <Fieldset legend="Document">
                    <div class="mb-3">
                        <label for="cv" class="block font-bold mb-1">Upload your CV</label>
                        <ul style="list-style-type:disc;" class="ml-4 mb-2">
                            <li><small><b>Format file .pdf</b></small></li>
                            <li><small><b>Maximal file size 1 Mb</b></small></li>
                        </ul>
                        <FileUpload 
                            mode="basic" 
                            ref="fileupload" 
                            name="files[]" 
                            accept=".pdf,.PDF" 
                            :url="uploadLink+'/cv'"
                            :multiple="true" 
                            :maxFileSize="1090000"
                            @before-upload="onBeforeUpload"
                        />
                    </div>
                </Fieldset>
            </template>
            <template #footer>
                <div class="flex gap-4 mt-5">
                    <Button v-if="messages != ''" label="Submit" severity="success" @click="saveProduct" />
                    <span v-else>{{ messages }}</span>
                </div>
            </template>
        </Card>
    </div>
    
    <AppFooter />
</template>
