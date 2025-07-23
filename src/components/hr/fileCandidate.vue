<script setup >
import { onMounted, ref, defineProps } from 'vue';
import { useToast } from 'primevue/usetoast';

import {axiosHr} from '@/service/axios';

const toast = useToast();

const account = ref({
    token: localStorage.getItem('token'),
    user_code: localStorage.getItem('user_code'),
});
const props = defineProps({
    params: Object,
});

const products = ref();
const product = ref({});
const fetch = async () =>{
    const response = await axiosHr.get('/candidates/files/'+props.params.code, {
        params:{
            token: account.value.token,
        }
    });
    products.value = response.data;
}

onMounted(() => {
    fetch();
});

const result = (saving) =>{
    if(saving.status == 200){
        if(saving.data.status == 200){
            toast.add({ severity: 'success', summary: saving.data.title, detail: saving.data.message, life: 4000 });
        }else{
            toast.add({ severity: 'warn', summary: saving.data.title, detail: saving.data.message, life: 4000 });
        }
        fetch();
    }else{
        toast.add({ severity: 'warn', summary: saving.status, detail: saving.statusText, life: 4000 });
    }
}

// upload
const uploadLink = ref(
    axiosHr.defaults.baseURL+'/upload'
);
const onBeforeUpload = (event) => {

    // Tambahkan parameter ke setiap file yang akan diupload
    event.formData.append("email", props.params.email);
    event.formData.append("name", props.params.name);
    event.formData.append("birth", props.params.birth);
    event.formData.append("gender", props.params.gender);

};
const onUploadSuccess = (event) => {
    fetch();
};

// delete
const deleteProductsDialog = ref(false);
const selectedProducts = ref();
function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

const deleteSelectedProducts = async () =>{
    const data = selectedProducts.value;
    const deleting = await axiosHr.delete('/candidates/files', {
        data: data,
        params:{
            token: localStorage.getItem('token'),
            user_code: localStorage.getItem('user_code'),
        }
    });
    result(deleting);

    deleteProductsDialog.value = false;
    selectedProducts.value = null;
}

// openExternalLink
const openLink = (link) =>{
    window.open(link, '_blank').focus();
}

</script>

<template>
    <Toast/>
    <div class="mb-6 ml-5">
        <FileUpload 
            mode="basic" 
            ref="fileupload" 
            name="files[]" 
            accept=".pdf,.PDF" 
            :url="uploadLink+'/cv?user_code='+account.user_code"
            :multiple="true" 
            :maxFileSize="1090000"
            @before-upload="onBeforeUpload"
            :auto="true"
            @upload="onUploadSuccess"
        />
        <label class="block font-bold">Upload CV format</label>
        <ul style="list-style-type:disc;" class="mb-2">
            <li><small><b>Format file .pdf</b></small></li>
            <li><small><b>Maximal file size 1 Mb</b></small></li>
        </ul>
        
    </div>
    <Toolbar class="mb-6" >
        <template #start>
            <Button label="Delete" severity="danger" text class="mr-2" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" title="Select data and delete." />
        </template>

        <template #center>
            <span class="text-xl font-bold">Candidates's File</span>
        </template>

        <template #end>
        </template>
    </Toolbar>

    <DataTable
        v-model:selection="selectedProducts"
        :value="products"
        dataKey="code"
        tableStyle="min-width: 50rem"
        scrollable scrollHeight="550px"
        :paginator="true"
        :rows="products?.length"
        paginatorTemplate="CurrentPageReport"
    >
        <template #paginatorstart>
        </template>
        <template #paginatorend>
        </template>

        
        <Column selectionMode="multiple" style="width: 1%" :exportable="false"></Column>
        <Column header="#" style="width: 1%">
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
        </Column>
        <Column field="original_name" header="Filename" sortable style="width: 20%">
            <template #body="slotProps">
                {{ slotProps.data.original_name }}
                <small title="Open Link" @click="openLink(slotProps.data.link)" class="cursor-pointer" >
                    <i class="pi pi-fw pi-external-link text-xs text-blue-500 ml-3"></i>
                </small>
            </template>
        </Column>
    </DataTable>

    <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="product">Are you sure you want to delete the selected items?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" severity="secondary" text @click="deleteProductsDialog = false" />
            <Button label="Yes" icon="pi pi-check" severity="danger" text @click="deleteSelectedProducts" />
        </template>
    </Dialog>
</template>
