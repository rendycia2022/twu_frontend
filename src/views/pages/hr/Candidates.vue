<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import {axiosHr} from '@/service/axios';

import fileCandidate from '@/components/hr/fileCandidate.vue';

const account = ref({
    token: localStorage.getItem('token'),
    user_code: localStorage.getItem('user_code'),
});

const fetch = async () =>{
    const response = await axiosHr.get('/candidates', {
        params:{
            token: account.value.token,
        }
    });
    products.value = response.data;
}

onMounted(() => {
    fetch();
});

const toast = useToast();
const dt = ref();
const products = ref();
const product = ref({});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// openExternalLink new tab
const hostUrl = import.meta.env.VITE_HOST_URL;
const openLink = (link) =>{
    window.open(link, '_blank').focus();
}

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

function exportCSV() {
    dt.value.exportCSV();
}

// deleting
const deleteProductsDialog = ref(false);
const selectedProducts = ref();
function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

const deleteSelectedProducts = async () =>{
    const data = selectedProducts.value;
    const deleting = await axiosHr.delete('/candidates', {
        data: data,
        params:{
            token: localStorage.getItem('token'),
            user_code: localStorage.getItem('user_code'),
        }
    });
    // console.log(deleting)
    result(deleting);

    deleteProductsDialog.value = false;
    selectedProducts.value = null;
}

const getFullDateTime = () => {
    
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),

        hours = d.getHours(),
        minutes = d.getMinutes(),
        seconds = d.getSeconds();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    let newDateFormated =  [year, month, day].join('-');

    let newTimeFormated = [hours, minutes, seconds].join('');

    return newDateFormated+" "+newTimeFormated;
}

// file
const fileProductsDialog = ref(false);
function fileOpen(prod) {
    fileProductsDialog.value = true;
    product.value = { ...prod };
}

</script>

<template>
    <Toast/>
    <div>
        <div class="card">
            <Toolbar class="mb-6" >
                <template #start>
                    <Button label="Delete" severity="danger" text class="mr-2" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" title="Select data and delete." />
                </template>

                <template #center>
                    <IconField class="mr-5">
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </IconField>
                    <span class="text-xl font-bold">Candidates</span>
                </template>

                <template #end>
                    <Button icon="pi pi-plus" severity="primary" text rounded @click="openLink(`${hostUrl}/public/signup`)" title="New data." />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                csvSeparator=";"
                :exportFilename="'Candidates_'+getFullDateTime()"
                v-model:selection="selectedProducts"
                :value="products"
                dataKey="code"
                :filters="filters"
                removableSort
                :paginator="true"
                :rows="50"
                :rowsPerPageOptions="[50, 100, 200]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Items"
                scrollable scrollHeight="550px"
            >
                <template #paginatorstart>
                </template>
                <template #paginatorend>
                    <Button type="button" icon="pi pi-download" text severity="secondary" @click="exportCSV($event)" title="Export." />
                </template>
                
                <Column selectionMode="multiple" style="width: 1%" :exportable="false"></Column>
                <Column header="#" style="width: 1%">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>
                <Column :exportable="false" style="width: 1%" >
                    <template #body="slotProps">
                        <Button label="Edit" text rounded class="mr-2" @click="openLink(`${hostUrl}/public/signup/${slotProps.data.code}`)" title="Edit." />
                    </template>
                </Column>
                <Column field="id_card" header="KTP" sortable style="width: 20%"></Column>
                <Column field="name" header="Name" sortable style="width: 20%"></Column>
                <Column field="email" header="Email" sortable style="width: 20%"></Column>
                <Column field="" header="" style="width: 20%">
                    <template #body="slotProps">
                        <Button icon="pi pi-file" severity="warn" rounded @click="fileOpen(slotProps.data)" title="Files."  />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true" >
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Are you sure you want to delete the selected items?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text @click="deleteProductsDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="danger" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>

        <Dialog v-model:visible="fileProductsDialog" :style="{ width: '720px' }" header=" " :modal="true">
            <fileCandidate :params="product" />
        </Dialog>
    </div>
</template>
