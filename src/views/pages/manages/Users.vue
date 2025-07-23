<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import {axiosSign} from '@/service/axios';

const account = ref({
    token: localStorage.getItem('token'),
    user_code: localStorage.getItem('user_code'),
});

const getRoles = async () =>{
    const response_roles = await axiosSign.get('/auth/roles', {
        params:{
            token: account.value.token,
            user_code: account.value.user_code,
        }
    });
    roles.value = response_roles.data;
}

const fetch = async () =>{
    const response = await axiosSign.get('/auth/users', {
        params:{
            token: account.value.token,
            user_code: account.value.user_code,
        }
    });
    products.value = response.data;
}

onMounted(() => {
    fetch();
    getRoles();
});

const toast = useToast();
const dt = ref();
const products = ref();
const productDialog = ref(false);
const product = ref({});
const editing = ref(false);
const submitted = ref(false);

const roles = ref();

const deleteProductsDialog = ref(false);
const selectedProducts = ref();

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function openNew() {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
    editing.value = false;
}

const saveProduct = async () =>{
    submitted.value = true;

    if (product?.value.email?.trim() || product?.value.name?.trim()) {
        const data = product.value;
        if(data.code){
            const saving = await axiosSign.put('/auth/users', data, {
                params:{
                    token: localStorage.getItem('token'),
                    user_code: localStorage.getItem('user_code'),
                }
            });
            result(saving);
        }else{
            const saving = await axiosSign.post('/auth/users', data, {
                params:{
                    token: localStorage.getItem('token'),
                    user_code: localStorage.getItem('user_code'),
                }
            });
            result(saving);
        }
        
        productDialog.value = false;
        product.value = {};
    }
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

function editProduct(prod) {
    editing.value = true;
    product.value = { ...prod };
    productDialog.value = true;
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

const deleteSelectedProducts = async () =>{
    const data = selectedProducts.value;
    const deleting = await axiosSign.delete('/auth/users', {
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

// reset password
const resetPasswordDialog = ref(false);
function confirmResetPassword(prod) {
    product.value = prod;
    resetPasswordDialog.value = true;
}

const resetPassword = async () =>{
    const data = product.value;
    const reseting = await axiosSign.delete('/auth/users/password', {
        data: data,
        params:{
            token: localStorage.getItem('token'),
            user_code: localStorage.getItem('user_code'),
        }
    });
    // console.log(deleting)
    result(reseting);

    resetPasswordDialog.value = false;
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
                    <span class="text-xl font-bold">Users</span>
                </template>

                <template #end>
                    <Button icon="pi pi-plus" severity="primary" text rounded @click="openNew" title="New data." />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                csvSeparator=";"
                :exportFilename="'Users_'+getFullDateTime()"
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
                    <Button type="button" icon="pi pi-download" text severity="secondary" @click="exportCSV($event)" title="Export data." />
                </template>

                
                <Column selectionMode="multiple" style="width: 1%" :exportable="false"></Column>
                <Column header="#" style="width: 1%">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>
                <Column :exportable="false" style="width: 1%" >
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" title="Edit data." />
                    </template>
                </Column>
                <Column field="email" header="Email" sortable style="width: 10%"></Column>
                <Column :exportable="false" style="width: 1%" >
                    <template #body="slotProps">
                        <Button icon="pi pi-refresh" severity="warn" rounded class="mr-2" @click="confirmResetPassword(slotProps.data)" title="Reset password." />
                    </template>
                </Column>
                <Column field="name" header="Name" sortable style="width: 20%"></Column>
                <Column field="role.name" header="Role" sortable style="width: 10%"></Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="productDialog" :style="{ width: '720px' }" header="Details" :modal="true">
            <div class="flex flex-col gap-6">
                <Fieldset legend="Account">
                    <div class="mb-3" ></div>
                    <div class="mb-3" >
                        <label for="email" class="block font-bold mb-1">Email</label>
                        <InputText v-if="editing" id="email" v-model.trim="product.email" required="true" autofocus :invalid="submitted && !product.email" fluid readonly />
                        <InputText v-else id="email" v-model.trim="product.email" required="true" autofocus :invalid="submitted && !product.email" fluid  />
                        <small v-if="submitted && !product.email" class="text-red-500">Email is required.</small>
                    </div>
                    <div class="mb-3" >
                        <label for="password" class="block font-bold mb-1">Password</label>
                        <span id="password" >Default Password is </span><span class="font-bold">123456</span>
                    </div>
                    <div class="mb-3" >
                        <label for="roles" class="block font-bold mb-1">Roles</label>
                        <Select v-model="product.role" :options="roles" optionLabel="name" placeholder="Select a Role" autofocus :invalid="submitted && !product.name" fluid />
                    </div>
                    <div class="mb-3" >
                        <label for="name" class="block font-bold mb-1">Name</label>
                        <InputText id="name" v-model.trim="product.name" required="true" autofocus :invalid="submitted && !product.name" fluid />
                        <small v-if="submitted && !product.name" class="text-red-500">Name is required.</small>
                    </div>
                </Fieldset>
                
            </div>

            <template #footer>
                <Button label="Save" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>

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

        <Dialog v-model:visible="resetPasswordDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product"
                    >Are you sure you want to reset <b>{{ product.email }}</b
                    >'s password?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" severity="secondary" text @click="resetPasswordDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="warn" text @click="resetPassword" />
            </template>
        </Dialog>
    </div>
</template>