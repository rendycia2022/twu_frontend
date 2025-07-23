<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import {axiosSign} from '@/service/axios';

const router = useRouter();
const account = ref({
    token: localStorage.getItem('token'),
    user_code: localStorage.getItem('user_code'),
});

const fetch = async () =>{
    // console.log(account.value.userId)
    const response = await axiosSign.get('/auth/users/'+account.value.user_code, {
        params:{
            token: account.value.token,
        }
    });
    product.value = response.data;
}

onMounted(() => {
    fetch();
});

const toast = useToast();
const product = ref({});
const submitted = ref(false);

const result = async (saving) =>{
    if(saving.status == 200){
        if(saving.data.status == 200){
            toast.add({ severity: 'success', summary: saving.data.title, detail: saving.data.message, life: 4000 });
            localStorage.removeItem('token');
            
            setTimeout(() => {
                window.location.reload(true);
            }, 5000); // 5 seconds
        }else{
            toast.add({ severity: 'warn', summary: saving.data.title, detail: saving.data.message, life: 4000 });
        }
        fetch();
    }else{
        toast.add({ severity: 'warn', summary: saving.status, detail: saving.statusText, life: 4000 });
    }
}

const setPassword = async () =>{
    submitted.value = true;

    const data = product.value;
    const saving = await axiosSign.post('/auth/users/password', data, {
                params:{
                    token: localStorage.getItem('token'),
                    user_code: localStorage.getItem('user_code'),
                }
            });
    result(saving);
    if(saving.status == 200){
        submitted.value = false;
    }
    
}

</script>

<template>
    <Toast/>
    <div>
        <div class="card">
            <div class="flex gap-5 ">
                <div class="font-semibold text-xl mt-1">Manage Account</div>
            </div>
            
            <Tabs value="0">
                <TabList>
                    <Tab value="0">Personal Info</Tab>
                    <Tab value="1">Account</Tab>
                    <Tab value="2">Security</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <div class="flex items-center gap-2 mb-4">
                            <label for="role" class="font-semibold w-24">Name :</label>
                            <span id="email">{{ product.name }}</span>
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <div class="flex items-center gap-2 mb-4">
                            <label for="email" class="font-semibold w-24 p-fluid">Email :</label>
                            <span id="email">{{ product.email }}</span>
                        </div>
                        <div class="flex items-center gap-2 mb-4">
                            <label for="role" class="font-semibold w-24">Role :</label>
                            <span id="role">{{ product.role?.name }}</span>
                        </div>
                    </TabPanel>
                    <TabPanel value="2">
                        <div class="flex items-center gap-9 mb-4">
                            <div class="w-full">
                                <Password v-model="product.newPassword" placeholder="Enter new password" :toggleMask="true" class="mb-2" fluid :feedback="true"></Password>
                                <Password v-model="product.confirmPassword" placeholder="Confirm new Password" :toggleMask="true" fluid :feedback="false" 
                                    :invalid="submitted && !product.confirmPassword || product.newPassword != product.confirmPassword"
                                ></Password>
                                <small v-if="submitted && !product.confirmPassword || product.newPassword != product.confirmPassword" class="text-red-500">Password not match.</small>
                            </div>
                        </div>
                        <div class="flex justify-content-end">
                            <Button label="Save password" severity="warn" @click="setPassword" title="Saving new password" :disabled="!product.newPassword || product.newPassword != product.confirmPassword" />
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>