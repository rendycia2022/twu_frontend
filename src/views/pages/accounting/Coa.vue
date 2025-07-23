<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import {axiosFna} from '@/service/axios';

const router = useRouter();
const toast = useToast();

const account = ref({
    token: localStorage.getItem('token'),
    user_code: localStorage.getItem('user_code'),
});

// filter
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// export
const dt = ref();
function exportCSV() {
    dt.value.exportCSV();
}

// addons
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

const fetch = async () =>{
    // console.log(account.value.userId)
    const response = await axiosFna.get('/accounting/coa', {
        params:{
            token: account.value.token,
        }
    });
    product.value = response.data;
    console.log(product.value);
}

onMounted(() => {
    fetch();
});

// data
const products = ref();
const product = ref({});

const result = async (saving) =>{       
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

// editing
const payload = ref({});
const onCellEditComplete = async (event) => {
    let { data, newValue, field } = event;

    payload.value = data;
    payload.value[field] = newValue;
    
    const newData = payload.value;
    const saving = await axiosHr.put('/psikotest/disc/question', newData, {
        params:{
            token: localStorage.getItem('token'),
            user_code: localStorage.getItem('user_code'),
        }
    });
    result(saving);
};

// deleting
const selectedProducts = ref();
const deleteProductsDialog = ref(false);
function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

const deleteSelectedProducts = async () =>{
    const data = selectedProducts.value;
    const deleting = await axiosHr.delete('/psikotest/disc/question', {
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
                    <span class="text-xl font-bold">Chart of Accounts</span>
                </template>

                <template #end>
                    
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                csvSeparator=";"
                :exportFilename="'Chart_of_Accounts_'+getFullDateTime()"
                v-model:selection="selectedProducts"
                :value="products" 
                dataKey="code"
                :filters="filters"
                tableStyle="min-width: 50rem"
                scrollable scrollHeight="550px"
                :paginator="true"
                :rows="products?.length"
                paginatorTemplate="CurrentPageReport"
                currentPageReportTemplate="Showing {totalRecords} Items"
                editMode="cell" @cell-edit-complete="onCellEditComplete"
            >
                <template #paginatorstart>
                </template>
                <template #paginatorend>
                    <Button type="button" icon="pi pi-download" text severity="secondary" @click="exportCSV($event)" title="Export data or template for import new data." />
                </template>

                <Column selectionMode="multiple" style="width: 1%" :exportable="false"></Column>
                <Column header="#" style="width: 1%">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>
                <Column field="representative.number" header="Number" style="width: 2%">
                    <template #body="slotProps">
                        <div class="item-center text-center gap-2">
                            <span>{{ slotProps.data.representative.number }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="alias" header="Initial" style="width: 2%"></Column>
                <Column field="question" header="Question" style="width: 20%">
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" autofocus fluid />
                    </template>
                </Column>
            </DataTable>
        </div>

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
    </div>
</template>